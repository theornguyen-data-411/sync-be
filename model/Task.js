/**
 * Task Schema
 *
 * Represents a user task with qualitative effort dimensions and derived
 * workload metrics (raw score, mana cost, energy zone).
 */

const mongoose = require('mongoose');

const LEVEL_ENUM = ['low', 'medium', 'high'];
const ENERGY_ZONE_ENUM = ['Peak', 'Balance', 'Low'];
const TAG_ENUM = ['deep_work', 'admin', 'communicating', 'learning'];

const SubtaskSchema = new mongoose.Schema(
  {
    title: { type: String, trim: true, required: true },
    isCompleted: { type: Boolean, default: false }
  },
  { _id: false }
);

const TaskSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true
    },
    description: {
      type: String,
      required: true,
      trim: true
    },
    aiSchedule: {
      type: Boolean,
      default: true
    },
    date: {
      type: Date
    },
    startTime: {
      type: String,
      trim: true
    },
    endTime: {
      type: String,
      trim: true
    },
    focusLevel: {
      type: String,
      enum: LEVEL_ENUM,
      required: true
    },
    mentalLoad: {
      type: String,
      enum: LEVEL_ENUM,
      required: true
    },
    movement: {
      type: String,
      enum: LEVEL_ENUM,
      required: true
    },
    urgency: {
      type: String,
      enum: LEVEL_ENUM,
      required: true
    },
    rawScore: {
      type: Number,
      min: 0,
      max: 27
    },
    manaCost: {
      type: Number,
      min: 0,
      max: 100
    },
    energyZone: {
      type: String,
      enum: ENERGY_ZONE_ENUM
    },
    scoringSource: {
      type: String,
      enum: ['ai', 'manual', 'mixed'],
      default: 'manual'
    },
    scoringDetails: {
      autoFilled: {
        focusLevel: { type: Boolean, default: false },
        mentalLoad: { type: Boolean, default: false },
        movement: { type: Boolean, default: false },
        urgency: { type: Boolean, default: false }
      },
      evaluatedAt: { type: Date }
    },
    tag: {
      type: String,
      enum: TAG_ENUM,
      required: true,
      default: 'admin'
    },
    tagSource: {
      type: String,
      enum: ['ai', 'manual'],
      default: 'manual'
    },
    repeat: {
      type: String,
      trim: true
    },
    note: {
      type: String,
      trim: true
    },
    subtasks: {
      type: [SubtaskSchema],
      default: []
    },
    status: {
      type: String,
      enum: ['pending', 'in_progress', 'completed', 'cancelled'],
      default: 'pending'
    },
    locked: {
      type: Boolean,
      default: false
    },
    enableEnergyRating: {
      type: Boolean,
      default: true
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model('Task', TaskSchema);

