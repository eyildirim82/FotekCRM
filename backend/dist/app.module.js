"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AppModule = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const app_controller_1 = require("./app.controller");
const app_service_1 = require("./app.service");
const auth_module_1 = require("./auth/auth.module");
const companies_module_1 = require("./companies/companies.module");
const contacts_module_1 = require("./contacts/contacts.module");
const user_entity_1 = require("./entities/user.entity");
const company_entity_1 = require("./entities/company.entity");
const contact_entity_1 = require("./entities/contact.entity");
let AppModule = class AppModule {
};
exports.AppModule = AppModule;
exports.AppModule = AppModule = __decorate([
    (0, common_1.Module)({
        imports: [
            typeorm_1.TypeOrmModule.forRoot({
                type: 'mssql',
                host: process.env.DB_HOST || 'db',
                port: parseInt(process.env.DB_PORT) || 1433,
                username: process.env.DB_USER || 'sa',
                password: process.env.DB_PASSWORD || 'FotekCRM2025!',
                database: process.env.DB_NAME || 'master',
                entities: [user_entity_1.User, company_entity_1.Company, contact_entity_1.Contact],
                synchronize: true,
                options: {
                    encrypt: false,
                    trustServerCertificate: true,
                },
            }),
            auth_module_1.AuthModule,
            companies_module_1.CompaniesModule,
            contacts_module_1.ContactsModule,
        ],
        controllers: [app_controller_1.AppController],
        providers: [app_service_1.AppService],
    })
], AppModule);
//# sourceMappingURL=app.module.js.map