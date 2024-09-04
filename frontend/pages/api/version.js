export default function handler(req, res) {
    res.status(200).json({ version: process.env.BUILD_VERSION || 'unknown' })
}