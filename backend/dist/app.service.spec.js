"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const testing_1 = require("@nestjs/testing");
const app_service_1 = require("./app.service");
describe('AppService', () => {
    let service;
    beforeEach(async () => {
        const module = await testing_1.Test.createTestingModule({
            providers: [app_service_1.AppService],
        }).compile();
        service = module.get(app_service_1.AppService);
    });
    it('should be defined', () => {
        expect(service).toBeDefined();
    });
    describe('getHello', () => {
        it('should return hello message', () => {
            const result = service.getHello();
            expect(result).toBe('Fotek CRM API v1.0 - NestJS Backend!');
        });
    });
    describe('getHealth', () => {
        it('should return health status', () => {
            const result = service.getHealth();
            expect(result).toHaveProperty('status', 'OK');
            expect(result).toHaveProperty('service', 'Fotek CRM API');
            expect(result).toHaveProperty('version', '1.0.0');
            expect(result).toHaveProperty('timestamp');
            expect(result).toHaveProperty('environment');
            expect(() => new Date(result.timestamp)).not.toThrow();
        });
        it('should return current environment', () => {
            const result = service.getHealth();
            expect(typeof result.environment).toBe('string');
            expect(result.environment).toBeTruthy();
        });
    });
});
//# sourceMappingURL=app.service.spec.js.map