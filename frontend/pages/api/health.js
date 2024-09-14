export default function handler(req, res) {
    const environment = process.env.NODE_ENV || 'production';
    res.status(200).json({ 
        status: 'Healthy',
        environment: environment
    });
}