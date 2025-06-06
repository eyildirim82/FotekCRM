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
Object.defineProperty(exports, "__esModule", { value: true });
exports.Contact = exports.ContactStatus = exports.ContactType = void 0;
const typeorm_1 = require("typeorm");
const company_entity_1 = require("./company.entity");
const user_entity_1 = require("./user.entity");
var ContactType;
(function (ContactType) {
    ContactType["EMPLOYEE"] = "employee";
    ContactType["MANAGER"] = "manager";
    ContactType["DECISION_MAKER"] = "decision_maker";
    ContactType["TECHNICAL"] = "technical";
    ContactType["FINANCIAL"] = "financial";
    ContactType["OTHER"] = "other";
})(ContactType || (exports.ContactType = ContactType = {}));
var ContactStatus;
(function (ContactStatus) {
    ContactStatus["ACTIVE"] = "active";
    ContactStatus["INACTIVE"] = "inactive";
    ContactStatus["LEFT_COMPANY"] = "left_company";
    ContactStatus["NO_CONTACT"] = "no_contact";
})(ContactStatus || (exports.ContactStatus = ContactStatus = {}));
let Contact = class Contact {
    get fullName() {
        return `${this.firstName} ${this.lastName}`.trim();
    }
    get displayName() {
        return this.jobTitle
            ? `${this.fullName} (${this.jobTitle})`
            : this.fullName;
    }
};
exports.Contact = Contact;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)('uuid'),
    __metadata("design:type", String)
], Contact.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'nvarchar', length: 100 }),
    __metadata("design:type", String)
], Contact.prototype, "firstName", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'nvarchar', length: 100 }),
    __metadata("design:type", String)
], Contact.prototype, "lastName", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'nvarchar', length: 255, nullable: true }),
    __metadata("design:type", String)
], Contact.prototype, "email", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'nvarchar', length: 50, nullable: true }),
    __metadata("design:type", String)
], Contact.prototype, "phone", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'nvarchar', length: 50, nullable: true }),
    __metadata("design:type", String)
], Contact.prototype, "mobile", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'nvarchar', length: 100, nullable: true }),
    __metadata("design:type", String)
], Contact.prototype, "jobTitle", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'nvarchar', length: 100, nullable: true }),
    __metadata("design:type", String)
], Contact.prototype, "department", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: 'nvarchar',
        length: 20,
        enum: ContactType,
        default: ContactType.EMPLOYEE
    }),
    __metadata("design:type", String)
], Contact.prototype, "contactType", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: 'nvarchar',
        length: 20,
        enum: ContactStatus,
        default: ContactStatus.ACTIVE
    }),
    __metadata("design:type", String)
], Contact.prototype, "status", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'bit', default: 1 }),
    __metadata("design:type", Boolean)
], Contact.prototype, "isPrimary", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'bit', default: 1 }),
    __metadata("design:type", Boolean)
], Contact.prototype, "isActive", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'nvarchar', length: 255, nullable: true }),
    __metadata("design:type", String)
], Contact.prototype, "linkedInUrl", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'nvarchar', length: 255, nullable: true }),
    __metadata("design:type", String)
], Contact.prototype, "skype", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'nvarchar', length: 255, nullable: true }),
    __metadata("design:type", String)
], Contact.prototype, "address", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'date', nullable: true }),
    __metadata("design:type", Date)
], Contact.prototype, "birthDate", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'ntext', nullable: true }),
    __metadata("design:type", String)
], Contact.prototype, "notes", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'uniqueidentifier' }),
    __metadata("design:type", String)
], Contact.prototype, "companyId", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => company_entity_1.Company, { eager: true }),
    (0, typeorm_1.JoinColumn)({ name: 'companyId' }),
    __metadata("design:type", company_entity_1.Company)
], Contact.prototype, "company", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'uniqueidentifier' }),
    __metadata("design:type", String)
], Contact.prototype, "createdById", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => user_entity_1.User),
    (0, typeorm_1.JoinColumn)({ name: 'createdById' }),
    __metadata("design:type", user_entity_1.User)
], Contact.prototype, "createdBy", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)(),
    __metadata("design:type", Date)
], Contact.prototype, "createdAt", void 0);
__decorate([
    (0, typeorm_1.UpdateDateColumn)(),
    __metadata("design:type", Date)
], Contact.prototype, "updatedAt", void 0);
exports.Contact = Contact = __decorate([
    (0, typeorm_1.Entity)('contacts'),
    (0, typeorm_1.Index)(['companyId']),
    (0, typeorm_1.Index)(['createdById']),
    (0, typeorm_1.Index)(['email'])
], Contact);
//# sourceMappingURL=contact.entity.js.map