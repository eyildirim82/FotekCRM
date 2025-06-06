"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ContactsController = void 0;
const common_1 = require("@nestjs/common");
const jwt_auth_guard_1 = require("../auth/jwt-auth.guard");
const contacts_service_1 = require("./contacts.service");
const create_contact_dto_1 = require("./dto/create-contact.dto");
const update_contact_dto_1 = require("./dto/update-contact.dto");
const contact_entity_1 = require("../entities/contact.entity");
let ContactsController = class ContactsController {
    constructor(contactsService) {
        this.contactsService = contactsService;
    }
    async create(createContactDto, req) {
        try {
            const contact = await this.contactsService.create(createContactDto, req.user.userId);
            return {
                success: true,
                message: 'Kişi başarıyla oluşturuldu',
                data: contact
            };
        }
        catch (error) {
            throw error;
        }
    }
    async findAll(page, limit, search, companyId, contactType, status, req) {
        try {
            const result = await this.contactsService.findAll(page || 1, limit || 10, search, companyId, contactType, status, req.user.userId);
            return {
                success: true,
                message: 'Kişiler başarıyla listelendi',
                data: result
            };
        }
        catch (error) {
            throw error;
        }
    }
    async getStats(companyId, req) {
        try {
            const stats = await this.contactsService.getStats(req.user.userId, companyId);
            return {
                success: true,
                message: 'İstatistikler başarıyla alındı',
                data: stats
            };
        }
        catch (error) {
            throw error;
        }
    }
    async findByCompany(companyId, req) {
        try {
            const contacts = await this.contactsService.findByCompany(companyId, req.user.userId);
            return {
                success: true,
                message: 'Firma kişileri başarıyla listelendi',
                data: contacts
            };
        }
        catch (error) {
            throw error;
        }
    }
    async findOne(id, req) {
        try {
            const contact = await this.contactsService.findOne(id, req.user.userId);
            return {
                success: true,
                message: 'Kişi başarıyla bulundu',
                data: contact
            };
        }
        catch (error) {
            throw error;
        }
    }
    async update(id, updateContactDto, req) {
        try {
            const contact = await this.contactsService.update(id, updateContactDto, req.user.userId);
            return {
                success: true,
                message: 'Kişi başarıyla güncellendi',
                data: contact
            };
        }
        catch (error) {
            throw error;
        }
    }
    async remove(id, req) {
        try {
            await this.contactsService.remove(id, req.user.userId);
            return {
                success: true,
                message: 'Kişi başarıyla silindi'
            };
        }
        catch (error) {
            throw error;
        }
    }
};
exports.ContactsController = ContactsController;
__decorate([
    (0, common_1.Post)(),
    __param(0, (0, common_1.Body)(common_1.ValidationPipe)),
    __param(1, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [create_contact_dto_1.CreateContactDto, Object]),
    __metadata("design:returntype", Promise)
], ContactsController.prototype, "create", null);
__decorate([
    (0, common_1.Get)(),
    __param(0, (0, common_1.Query)('page', new common_1.ParseIntPipe({ optional: true }))),
    __param(1, (0, common_1.Query)('limit', new common_1.ParseIntPipe({ optional: true }))),
    __param(2, (0, common_1.Query)('search')),
    __param(3, (0, common_1.Query)('companyId')),
    __param(4, (0, common_1.Query)('contactType')),
    __param(5, (0, common_1.Query)('status')),
    __param(6, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, Number, String, String, String, String, Object]),
    __metadata("design:returntype", Promise)
], ContactsController.prototype, "findAll", null);
__decorate([
    (0, common_1.Get)('stats'),
    __param(0, (0, common_1.Query)('companyId')),
    __param(1, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], ContactsController.prototype, "getStats", null);
__decorate([
    (0, common_1.Get)('company/:companyId'),
    __param(0, (0, common_1.Param)('companyId', common_1.ParseUUIDPipe)),
    __param(1, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], ContactsController.prototype, "findByCompany", null);
__decorate([
    (0, common_1.Get)(':id'),
    __param(0, (0, common_1.Param)('id', common_1.ParseUUIDPipe)),
    __param(1, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], ContactsController.prototype, "findOne", null);
__decorate([
    (0, common_1.Patch)(':id'),
    __param(0, (0, common_1.Param)('id', common_1.ParseUUIDPipe)),
    __param(1, (0, common_1.Body)(common_1.ValidationPipe)),
    __param(2, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, update_contact_dto_1.UpdateContactDto, Object]),
    __metadata("design:returntype", Promise)
], ContactsController.prototype, "update", null);
__decorate([
    (0, common_1.Delete)(':id'),
    __param(0, (0, common_1.Param)('id', common_1.ParseUUIDPipe)),
    __param(1, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], ContactsController.prototype, "remove", null);
exports.ContactsController = ContactsController = __decorate([
    (0, common_1.Controller)('contacts'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __metadata("design:paramtypes", [contacts_service_1.ContactsService])
], ContactsController);
//# sourceMappingURL=contacts.controller.js.map