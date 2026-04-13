/// <reference types="jest" />
import { LogLevels } from "../../main/enums/LogLevels";

describe("LogLevels enum", () => {
    it("should contain all expected states", () => {
        expect(LogLevels.ERROR).toBe("ERROR");
        expect(LogLevels.WARN).toBe("WARN");
        expect(LogLevels.INFO).toBe("INFO");
        expect(LogLevels.DEBUG).toBe("DEBUG");
    });

    it("should not contain unexpected states", () => {
        const values = Object.values(LogLevels);

        expect(values).toHaveLength(4);
        expect(values).toEqual([
            "DEBUG",
            "INFO",
            "WARN",
            "ERROR",
        ]);
    });

    it("should map keys to string literal values", () => {
        expect(typeof LogLevels.ERROR).toBe("string");
        expect(typeof LogLevels.WARN).toBe("string");
        expect(typeof LogLevels.INFO).toBe("string");
        expect(typeof LogLevels.DEBUG).toBe("string");
    });
});
