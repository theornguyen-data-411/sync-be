const User = require('../model/User');
const bscrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { OAuth2Client } = require('google-auth-library');

// Register a new user
exports.signup = async (req, res) => {
    try {
        const { email, password } = req.body;
        // Same email check
        if (await User.findOne({ email })) {
            return res.status(400).json({ msg: 'Email already exists' });
        }
        // Hash password
        const hashedPassword = await bscrypt.hash(password, 10);
        // Create user
        const newUser = new User({ email, password: hashedPassword });
        await newUser.save();
        res.status(201).json({ msg: 'User registered successfully' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
}

// Login user
exports.signin = async (req, res) => {
    try {
        const { email, password } = req.body;
        const user = await User.findOne({ email });

        if (!user || !(await bcrypt.compare(password, user.password))) {
            return res.status(400).json({ message: "Wrong password or email" });
        }

        // Create and sign token
        const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, { expiresIn: '7d' });

        res.json({
            message: "Login successful",
            token,
            user: { id: user._id, email: user.email, fullName: user.fullName }
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Get current user
exports.getProfile = async (req, res) => {
    try {
        const user = await User.findById(req.userId).select('-password');
        if (!user) return res.status(404).json({ message: "User does not exist" });
        res.json(user);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

//Google OAuth login
const client = new OAuth2Client(process.env.CLIENT_ID);

exports.googleSignin = async (req, res) => {
    try {
        const { idToken } = req.body; // iOS gửi cái này lên

        // 1. Xác thực token với Google Server
        const ticket = await client.verifyIdToken({
            idToken: idToken,
            audience: process.env.GOOGLE_CLIENT_ID, 
        });
        
        const payload = ticket.getPayload();
        // payload chứa: { email, name, picture, sub (googleId), ... }
        const { email, name, picture, sub } = payload;

        // 2. Kiểm tra xem user đã tồn tại chưa
        let user = await User.findOne({ email });

        if (user) {
            // Nếu user đã tồn tại nhưng chưa có googleId (vd: trước đây đăng ký bằng tay)
            // Thì cập nhật thêm googleId cho họ
            if (!user.googleId) {
                user.googleId = sub;
                user.authType = 'google'; // Hoặc giữ cả 2
                await user.save();
            }
        } else {
            // 3. Nếu chưa tồn tại -> Tạo user mới
            // Password để trống hoặc tạo một chuỗi ngẫu nhiên vì họ không dùng pass
            user = new User({
                email,
                fullName: name,
                avatarUrl: picture,
                googleId: sub,
                authType: 'google',
                password: null // Không cần password
            });
            await user.save();
        }

        // 4. Tạo Token riêng của hệ thống bạn (giống hệt API login thường)
        const token = jwt.sign(
            { userId: user._id }, 
            process.env.JWT_SECRET, 
            { expiresIn: '7d' }
        );

        res.json({
            message: "Google Login successful",
            token, // iOS sẽ lưu cái này để gọi các API khác
            user: { id: user._id, email: user.email, fullName: user.fullName, avatarUrl: user.avatarUrl }
        });

    } catch (error) {
        console.log(error);
        res.status(400).json({ message: "Google Token không hợp lệ" });
    }
};