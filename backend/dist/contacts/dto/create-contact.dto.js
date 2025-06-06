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
exports.CreateContactDto = void 0;
const class_validator_1 = require("class-validator");
const contact_entity_1 = require("../../entities/contact.entity");
class CreateContactDto {
}
exports.CreateContactDto = CreateContactDto;
__decorate([
    (0, class_validator_1.IsString)({ message: 'Ad alanı metin olmalıdır' }),
    (0, class_validator_1.Length)(1, 100, { message: 'Ad 1-100 karakter arasında olmalıdır' }),
    __metadata("design:type", String)
], CreateContactDto.prototype, "firstName", void 0);
__decorate([
    (0, class_validator_1.IsString)({ message: 'Soyad alanı metin olmalıdır' }),
    (0, class_validator_1.Length)(1, 100, { message: 'Soyad 1-100 karakter arasında olmalıdır' }),
    __metadata("design:type", String)
], CreateContactDto.prototype, "lastName", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsEmail)({}, { message: 'Geçerli bir email adresi giriniz' }),
    (0, class_validator_1.Length)(1, 255, { message: 'Email en fazla 255 karakter olabilir' }),
    __metadata("design:type", String)
], CreateContactDto.prototype, "email", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)({ message: 'Telefon alanı metin olmalıdır' }),
    (0, class_validator_1.Length)(1, 50, { message: 'Telefon en fazla 50 karakter olabilir' }),
    (0, class_validator_1.Matches)(/^[\d\s\-\+\(\)]+$/, { message: 'Geçerli bir telefon numarası giriniz' }),
    __metadata("design:type", String)
], CreateContactDto.prototype, "phone", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)({ message: 'Mobil telefon alanı metin olmalıdır' }),
    (0, class_validator_1.Length)(1, 50, { message: 'Mobil telefon en fazla 50 karakter olabilir' }),
    (0, class_validator_1.Matches)(/^[\d\s\-\+\(\)]+$/, { message: 'Geçerli bir mobil telefon numarası giriniz' }),
    __metadata("design:type", String)
], CreateContactDto.prototype, "mobile", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)({ message: 'Pozisyon alanı metin olmalıdır' }),
    (0, class_validator_1.Length)(1, 100, { message: 'Pozisyon en fazla 100 karakter olabilir' }),
    __metadata("design:type", String)
], CreateContactDto.prototype, "jobTitle", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)({ message: 'Departman alanı metin olmalıdır' }),
    (0, class_validator_1.Length)(1, 100, { message: 'Departman en fazla 100 karakter olabilir' }),
    __metadata("design:type", String)
], CreateContactDto.prototype, "department", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsEnum)(contact_entity_1.ContactType, { message: 'Geçerli bir kişi tipi seçiniz' }),
    __metadata("design:type", String)
], CreateContactDto.prototype, "contactType", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsEnum)(contact_entity_1.ContactStatus, { message: 'Geçerli bir durum seçiniz' }),
    __metadata("design:type", String)
], CreateContactDto.prototype, "status", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsBoolean)({ message: 'Birincil kişi alanı doğru/yanlış olmalıdır' }),
    __metadata("design:type", Boolean)
], CreateContactDto.prototype, "isPrimary", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsBoolean)({ message: 'Aktif durum alanı doğru/yanlış olmalıdır' }),
    __metadata("design:type", Boolean)
], CreateContactDto.prototype, "isActive", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)({ message: 'LinkedIn URL alanı metin olmalıdır' }),
    (0, class_validator_1.Length)(1, 255, { message: 'LinkedIn URL en fazla 255 karakter olabilir' }),
    __metadata("design:type", String)
], CreateContactDto.prototype, "linkedInUrl", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)({ message: 'Skype alanı metin olmalıdır' }),
    (0, class_validator_1.Length)(1, 255, { message: 'Skype en fazla 255 karakter olabilir' }),
    __metadata("design:type", String)
], CreateContactDto.prototype, "skype", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)({ message: 'Adres alanı metin olmalıdır' }),
    (0, class_validator_1.Length)(1, 255, { message: 'Adres en fazla 255 karakter olabilir' }),
    __metadata("design:type", String)
], CreateContactDto.prototype, "address", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsDateString)({}, { message: 'Geçerli bir doğum tarihi giriniz (YYYY-MM-DD)' }),
    __metadata("design:type", String)
], CreateContactDto.prototype, "birthDate", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)({ message: 'Notlar alanı metin olmalıdır' }),
    (0, class_validator_1.Length)(1, 1000, { message: 'Notlar en fazla 1000 karakter olabilir' }),
    __metadata("design:type", String)
], CreateContactDto.prototype, "notes", void 0);
__decorate([
    (0, class_validator_1.IsUUID)('4', { message: 'Geçerli bir firma ID\'si giriniz' }),
    __metadata("design:type", String)
], CreateContactDto.prototype, "companyId", void 0);
//# sourceMappingURL=create-contact.dto.js.map