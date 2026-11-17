// Removes try/catch from every controller
module.exports = (fn) => (req, res, next) => Promise.resolve(fn(req, res, next)).catch(next);
