/**
 * Task Controller
 *
 * Handles CRUD operations and AI-assisted scoring for tasks.
 */

const mongoose = require('mongoose');
const Task = require('../model/Task');
const { scoreTask, classifyTaskTag, normalizeLevel } = require('../services/taskScoringService');

const CRITERIA_KEYS = ['focusLevel', 'mentalLoad', 'movement', 'urgency'];
const ZONE_SORT_WEIGHT = { Peak: 0, Balance: 1, Low: 2 };

function sanitizeSubtasks(subtasks = []) {
    if (!Array.isArray(subtasks)) {
        return [];
    }
    return subtasks
        .filter(item => item && item.title)
        .map(item => ({
            title: String(item.title).trim(),
            isCompleted: Boolean(item.isCompleted)
        }));
}

function parseDate(value) {
    if (!value) return undefined;
    const date = new Date(value);
    return Number.isNaN(date.getTime()) ? undefined : date;
}

function buildScoringSource(meta, userProvidedKeys = []) {
    if (!meta.aiUsed) {
        return 'manual';
    }
    return userProvidedKeys.length > 0 ? 'mixed' : 'ai';
}

exports.createTask = async (req, res) => {
    try {
        const {
            description,
            aiSchedule = true,
            date,
            startTime,
            endTime,
            repeat = null,
            note,
            subtasks,
            status = 'pending',
            useAiScoring,
            useAiTagging,
            tag: requestedTag,
            enableEnergyRating = true,
            locked = false,
            ...levels
        } = req.body;

        // ========== REQUIRED FIELDS VALIDATION ==========
        
        // 1. Title (description) - Required
        if (!description || !description.trim()) {
            return res.status(400).json({ message: 'Task title (description) is required.' });
        }

        // 2. Start Time & End Time - Required
        if (!startTime || !startTime.trim()) {
            return res.status(400).json({ message: 'Start time is required.' });
        }
        if (!endTime || !endTime.trim()) {
            return res.status(400).json({ message: 'End time is required.' });
        }

        // 3. Energy Rating Fields - Required if enableEnergyRating is true
        const providedLevels = {};
        const userProvidedKeys = [];
        
        if (enableEnergyRating) {
            // If energy rating is enabled, all rating fields are required
            for (const key of CRITERIA_KEYS) {
                if (levels[key] === undefined || levels[key] === null || levels[key] === '') {
                    return res.status(400).json({ 
                        message: `${key} is required when energy rating is enabled.` 
                    });
                }
                providedLevels[key] = levels[key];
                userProvidedKeys.push(key);
            }
        } else {
            // If energy rating is disabled, set all to 'low' as defaults
            for (const key of CRITERIA_KEYS) {
                providedLevels[key] = levels[key] !== undefined ? levels[key] : 'low';
                if (levels[key] !== undefined) {
                    userProvidedKeys.push(key);
                }
            }
        }

        // ========== PROCESSING ==========

        // Calculate scoring only if energy rating is enabled
        let scoringResult = null;
        if (enableEnergyRating) {
            scoringResult = scoreTask({
                description,
                providedLevels,
                allowAi: useAiScoring ?? aiSchedule
            });
        } else {
            // If energy rating is disabled, still need to normalize levels for model requirements
            // but don't calculate energy metrics
            scoringResult = {
                normalizedLevels: {},
                rawScore: null,
                manaCost: null,
                energyZone: null,
                meta: {
                    autoFilled: {},
                    aiUsed: false,
                    evaluatedAt: new Date().toISOString()
                }
            };
            for (const key of CRITERIA_KEYS) {
                scoringResult.normalizedLevels[key] = normalizeLevel(providedLevels[key], 'low');
                scoringResult.meta.autoFilled[key] = false;
            }
        }

        // Tag classification (optional field)
        let tagResult;
        try {
            tagResult = classifyTaskTag({
                description,
                providedTag: requestedTag,
                allowAi: useAiTagging ?? aiSchedule
            });
        } catch (tagError) {
            // If tag is not provided and AI tagging is disabled, use default
            tagResult = {
                tag: 'admin',
                source: 'manual'
            };
        }

        // ========== CREATE TASK ==========
        const task = await Task.create({
            user: req.userId,
            description: description.trim(),
            aiSchedule,
            date: parseDate(date),
            startTime: startTime.trim(),
            endTime: endTime.trim(),
            repeat: repeat || null, // Default to null (Does not repeat)
            note: note ? note.trim() : undefined,
            status,
            subtasks: sanitizeSubtasks(subtasks),
            locked: Boolean(locked), // Default to false
            enableEnergyRating: Boolean(enableEnergyRating), // Default to true
            ...scoringResult.normalizedLevels,
            rawScore: scoringResult.rawScore,
            manaCost: scoringResult.manaCost,
            energyZone: scoringResult.energyZone,
            scoringSource: enableEnergyRating 
                ? buildScoringSource(scoringResult.meta, userProvidedKeys)
                : 'manual',
            scoringDetails: {
                autoFilled: scoringResult.meta.autoFilled,
                evaluatedAt: scoringResult.meta.evaluatedAt
            },
            tag: tagResult.tag,
            tagSource: tagResult.source
        });

        res.status(201).json({ task });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

exports.listTasks = async (req, res) => {
    try {
        const { energyZone, status, tag, date, from, to } = req.query;
        const filter = { user: req.userId };

        if (energyZone) {
            filter.energyZone = energyZone;
        }
        if (status) {
            filter.status = status;
        }
        if (tag) {
            filter.tag = tag;
        }
        if (date || from || to) {
            filter.date = {};
            if (date) {
                // Parse date string and create UTC date range
                // Handle both "YYYY-MM-DD" format and ISO strings
                const dateStr = String(date).trim();
                let day;

                // If it's in YYYY-MM-DD format, parse it as UTC
                if (/^\d{4}-\d{2}-\d{2}$/.test(dateStr)) {
                    day = new Date(dateStr + 'T00:00:00.000Z');
                } else {
                    day = new Date(dateStr);
                }

                if (!Number.isNaN(day.getTime())) {
                    // Create start of day in UTC
                    const start = new Date(Date.UTC(
                        day.getUTCFullYear(),
                        day.getUTCMonth(),
                        day.getUTCDate(),
                        0, 0, 0, 0
                    ));
                    // Create end of day in UTC
                    const end = new Date(Date.UTC(
                        day.getUTCFullYear(),
                        day.getUTCMonth(),
                        day.getUTCDate(),
                        23, 59, 59, 999
                    ));
                    filter.date.$gte = start;
                    filter.date.$lte = end;
                }
            } else {
                if (from) {
                    const fromDate = new Date(from);
                    if (!Number.isNaN(fromDate.getTime())) {
                        filter.date.$gte = fromDate;
                    }
                }
                if (to) {
                    const toDate = new Date(to);
                    if (!Number.isNaN(toDate.getTime())) {
                        // Set to end of day in UTC for 'to' parameter
                        const toEnd = new Date(Date.UTC(
                            toDate.getUTCFullYear(),
                            toDate.getUTCMonth(),
                            toDate.getUTCDate(),
                            23, 59, 59, 999
                        ));
                        filter.date.$lte = toEnd;
                    }
                }
            }

            if (Object.keys(filter.date).length === 0) {
                delete filter.date;
            }
        }

        const tasks = await Task.find(filter);

        const autoTasks = [];
        const manualTasks = [];

        for (const task of tasks) {
            if (task.aiSchedule) {
                autoTasks.push(task);
            } else {
                manualTasks.push(task);
            }
        }

        autoTasks.sort((a, b) => {
            const zoneDiff =
                (ZONE_SORT_WEIGHT[a.energyZone] ?? 99) -
                (ZONE_SORT_WEIGHT[b.energyZone] ?? 99);
            if (zoneDiff !== 0) return zoneDiff;
            const manaDiff = (b.manaCost ?? 0) - (a.manaCost ?? 0);
            if (manaDiff !== 0) return manaDiff;
            const dateDiff = (a.date?.getTime?.() || 0) - (b.date?.getTime?.() || 0);
            if (dateDiff !== 0) return dateDiff;
            return b.updatedAt.getTime() - a.updatedAt.getTime();
        });

        manualTasks.sort((a, b) => a.createdAt.getTime() - b.createdAt.getTime());

        const merged = [...autoTasks, ...manualTasks];

        res.json({ items: merged, count: merged.length });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

exports.getTask = async (req, res) => {
    try {
        const { id } = req.params;
        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({ message: 'Invalid task id.' });
        }

        const task = await Task.findOne({ _id: id, user: req.userId });
        if (!task) {
            return res.status(404).json({ message: 'Task not found.' });
        }

        res.json({ task });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

exports.updateTask = async (req, res) => {
    try {
        const { id } = req.params;
        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({ message: 'Invalid task id.' });
        }

        const existingTask = await Task.findOne({ _id: id, user: req.userId });
        if (!existingTask) {
            return res.status(404).json({ message: 'Task not found.' });
        }

        const updates = {};
        const mutableFields = [
            'description',
            'aiSchedule',
            'date',
            'startTime',
            'endTime',
            'tag',
            'repeat',
            'note',
            'status',
            'locked',
            'enableEnergyRating'
        ];

        for (const field of mutableFields) {
            if (field in req.body) {
                if (field === 'date') {
                    updates[field] = parseDate(req.body[field]);
                } else {
                    updates[field] = req.body[field];
                }
            }
        }

        if ('subtasks' in req.body) {
            updates.subtasks = sanitizeSubtasks(req.body.subtasks);
        }

        const userProvidedKeys = CRITERIA_KEYS.filter(key => key in req.body);
        const needsScoring =
            req.body.useAiScoring === true ||
            req.body.forceRecalculate === true ||
            userProvidedKeys.length > 0;

        if (needsScoring) {
            const providedLevels = {};
            for (const key of CRITERIA_KEYS) {
                if (key in req.body) {
                    providedLevels[key] = req.body[key];
                } else if (!(req.body.useAiScoring === true)) {
                    providedLevels[key] = existingTask[key];
                }
            }

            const scoringResult = scoreTask({
                description: updates.description ?? existingTask.description,
                providedLevels,
                allowAi: req.body.useAiScoring ?? existingTask.aiSchedule
            });

            for (const key of CRITERIA_KEYS) {
                updates[key] = scoringResult.normalizedLevels[key];
            }

            updates.rawScore = scoringResult.rawScore;
            updates.manaCost = scoringResult.manaCost;
            updates.energyZone = scoringResult.energyZone;
            updates.scoringSource = buildScoringSource(
                scoringResult.meta,
                userProvidedKeys
            );
            updates.scoringDetails = {
                autoFilled: scoringResult.meta.autoFilled,
                evaluatedAt: scoringResult.meta.evaluatedAt
            };
        }

        if ('tag' in req.body || req.body.useAiTagging === true) {
            const tagResult = classifyTaskTag({
                description: updates.description ?? existingTask.description,
                providedTag: req.body.tag,
                allowAi: req.body.useAiTagging ?? req.body.useAiScoring ?? existingTask.aiSchedule
            });
            updates.tag = tagResult.tag;
            updates.tagSource = tagResult.source;
        }

        const updatedTask = await Task.findByIdAndUpdate(
            existingTask._id,
            { $set: updates },
            { new: true }
        );

        res.json({ task: updatedTask });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

exports.deleteTask = async (req, res) => {
    try {
        const { id } = req.params;
        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({ message: 'Invalid task id.' });
        }

        const deleted = await Task.findOneAndDelete({ _id: id, user: req.userId });
        if (!deleted) {
            return res.status(404).json({ message: 'Task not found.' });
        }

        res.json({ message: 'Task deleted successfully.' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

exports.previewScore = async (req, res) => {
    try {
        const { description, useAiScoring = true, useAiTagging = true, tag, ...levels } = req.body;
        const providedLevels = {};
        const userProvidedKeys = [];
        for (const key of CRITERIA_KEYS) {
            if (levels[key] !== undefined) {
                providedLevels[key] = levels[key];
                userProvidedKeys.push(key);
            }
        }

        const scoringResult = scoreTask({
            description,
            providedLevels,
            allowAi: useAiScoring
        });

        const tagResult = classifyTaskTag({
            description,
            providedTag: tag,
            allowAi: useAiTagging
        });

        res.json({
            ...scoringResult,
            scoringSource: buildScoringSource(scoringResult.meta, userProvidedKeys),
            tag: tagResult.tag,
            tagSource: tagResult.source
        });
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};


