"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const dotenv_1 = __importDefault(require("dotenv"));
const mongoose_1 = __importDefault(require("mongoose"));
const auth_1 = __importDefault(require("./routes/auth"));
const purchase_1 = __importDefault(require("./routes/purchase"));
const dashboard_1 = __importDefault(require("./routes/dashboard"));
dotenv_1.default.config();
const app = (0, express_1.default)();
app.use((0, cors_1.default)());
app.use(express_1.default.json());
app.use("/api/auth", auth_1.default);
app.use("/api/purchase", purchase_1.default);
app.use("/api/dashboard", dashboard_1.default);
const PORT = process.env.PORT || 4000;
async function start() {
    try {
        const MONGO_URI = process.env.MONGO_URI;
        if (!MONGO_URI)
            throw new Error("MONGO_URI missing");
        await mongoose_1.default.connect(MONGO_URI);
        console.log("MongoDB connected");
        app.listen(PORT, () => {
            console.log(`Server running on port ${PORT}`);
        });
    }
    catch (err) {
        console.error(err);
        process.exit(1);
    }
}
start();
