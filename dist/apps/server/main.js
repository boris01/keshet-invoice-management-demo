/******/ (() => { // webpackBootstrap
/******/ 	"use strict";
/******/ 	var __webpack_modules__ = ([
/* 0 */,
/* 1 */
/***/ ((module) => {

module.exports = require("tslib");

/***/ }),
/* 2 */
/***/ ((module) => {

module.exports = require("@nestjs/common");

/***/ }),
/* 3 */
/***/ ((module) => {

module.exports = require("@nestjs/core");

/***/ }),
/* 4 */
/***/ ((module) => {

module.exports = require("nestjs-pino");

/***/ }),
/* 5 */
/***/ ((module) => {

module.exports = require("helmet");

/***/ }),
/* 6 */
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.AppModule = void 0;
const tslib_1 = __webpack_require__(1);
const common_1 = __webpack_require__(2);
const core_1 = __webpack_require__(3);
const typeorm_1 = __webpack_require__(7);
const throttler_1 = __webpack_require__(8);
const nestjs_pino_1 = __webpack_require__(4);
const cache_manager_1 = __webpack_require__(9);
const event_emitter_1 = __webpack_require__(10);
const health_module_1 = __webpack_require__(11);
const invoice_module_1 = __webpack_require__(13);
const invoice_entity_1 = __webpack_require__(14);
const file_storage_entity_1 = __webpack_require__(19);
let AppModule = class AppModule {
};
exports.AppModule = AppModule;
exports.AppModule = AppModule = tslib_1.__decorate([
    (0, common_1.Module)({
        imports: [
            typeorm_1.TypeOrmModule.forRoot({
                type: 'better-sqlite3',
                database: ':memory:',
                entities: [invoice_entity_1.InvoiceEntity, file_storage_entity_1.FileStorageEntity],
                synchronize: true,
            }),
            throttler_1.ThrottlerModule.forRoot([{ ttl: 60000, limit: 60 }]),
            nestjs_pino_1.LoggerModule.forRoot({
                pinoHttp: {
                    transport: {
                        target: 'pino-pretty',
                    },
                },
            }),
            cache_manager_1.CacheModule.registerAsync({
                isGlobal: true,
                useFactory: async () => {
                    if (process.env.REDIS_URL) {
                        const KeyvRedis = (await Promise.resolve().then(() => tslib_1.__importStar(__webpack_require__(39)))).default;
                        return {
                            stores: [new KeyvRedis(process.env.REDIS_URL)],
                        };
                    }
                    return {};
                },
            }),
            event_emitter_1.EventEmitterModule.forRoot(),
            health_module_1.HealthModule,
            invoice_module_1.InvoiceModule,
        ],
        providers: [
            {
                provide: core_1.APP_GUARD,
                useClass: throttler_1.ThrottlerGuard,
            },
        ],
    })
], AppModule);


/***/ }),
/* 7 */
/***/ ((module) => {

module.exports = require("@nestjs/typeorm");

/***/ }),
/* 8 */
/***/ ((module) => {

module.exports = require("@nestjs/throttler");

/***/ }),
/* 9 */
/***/ ((module) => {

module.exports = require("@nestjs/cache-manager");

/***/ }),
/* 10 */
/***/ ((module) => {

module.exports = require("@nestjs/event-emitter");

/***/ }),
/* 11 */
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.HealthModule = void 0;
const tslib_1 = __webpack_require__(1);
const common_1 = __webpack_require__(2);
const health_controller_1 = __webpack_require__(12);
let HealthModule = class HealthModule {
};
exports.HealthModule = HealthModule;
exports.HealthModule = HealthModule = tslib_1.__decorate([
    (0, common_1.Module)({
        controllers: [health_controller_1.HealthController],
    })
], HealthModule);


/***/ }),
/* 12 */
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.HealthController = void 0;
const tslib_1 = __webpack_require__(1);
const common_1 = __webpack_require__(2);
let HealthController = class HealthController {
    readiness() {
        return { status: 'ok', timestamp: new Date().toISOString() };
    }
    liveness() {
        return { status: 'ok' };
    }
};
exports.HealthController = HealthController;
tslib_1.__decorate([
    (0, common_1.Get)(),
    tslib_1.__metadata("design:type", Function),
    tslib_1.__metadata("design:paramtypes", []),
    tslib_1.__metadata("design:returntype", void 0)
], HealthController.prototype, "readiness", null);
tslib_1.__decorate([
    (0, common_1.Get)('live'),
    tslib_1.__metadata("design:type", Function),
    tslib_1.__metadata("design:paramtypes", []),
    tslib_1.__metadata("design:returntype", void 0)
], HealthController.prototype, "liveness", null);
exports.HealthController = HealthController = tslib_1.__decorate([
    (0, common_1.Controller)('health')
], HealthController);


/***/ }),
/* 13 */
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.InvoiceModule = void 0;
const tslib_1 = __webpack_require__(1);
const common_1 = __webpack_require__(2);
const typeorm_1 = __webpack_require__(7);
const invoice_entity_1 = __webpack_require__(14);
const invoice_controller_1 = __webpack_require__(20);
const invoice_service_1 = __webpack_require__(22);
const invoice_repository_1 = __webpack_require__(23);
const invoice_seeder_1 = __webpack_require__(28);
const file_storage_module_1 = __webpack_require__(33);
let InvoiceModule = class InvoiceModule {
};
exports.InvoiceModule = InvoiceModule;
exports.InvoiceModule = InvoiceModule = tslib_1.__decorate([
    (0, common_1.Module)({
        imports: [typeorm_1.TypeOrmModule.forFeature([invoice_entity_1.InvoiceEntity]), file_storage_module_1.FileStorageModule],
        controllers: [invoice_controller_1.InvoiceController],
        providers: [invoice_service_1.InvoiceService, invoice_repository_1.InvoiceRepository, invoice_seeder_1.InvoiceSeeder],
        exports: [invoice_service_1.InvoiceService],
    })
], InvoiceModule);


/***/ }),
/* 14 */
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {


var _a, _b;
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.InvoiceEntity = void 0;
const tslib_1 = __webpack_require__(1);
const typeorm_1 = __webpack_require__(15);
const shared_1 = __webpack_require__(16);
const file_storage_entity_1 = __webpack_require__(19);
let InvoiceEntity = class InvoiceEntity {
};
exports.InvoiceEntity = InvoiceEntity;
tslib_1.__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)('uuid'),
    tslib_1.__metadata("design:type", String)
], InvoiceEntity.prototype, "id", void 0);
tslib_1.__decorate([
    (0, typeorm_1.Column)(),
    tslib_1.__metadata("design:type", String)
], InvoiceEntity.prototype, "invoiceNumber", void 0);
tslib_1.__decorate([
    (0, typeorm_1.Column)({ type: 'varchar' }),
    tslib_1.__metadata("design:type", typeof (_a = typeof shared_1.InvoiceStatus !== "undefined" && shared_1.InvoiceStatus) === "function" ? _a : Object)
], InvoiceEntity.prototype, "status", void 0);
tslib_1.__decorate([
    (0, typeorm_1.Column)(),
    tslib_1.__metadata("design:type", String)
], InvoiceEntity.prototype, "description", void 0);
tslib_1.__decorate([
    (0, typeorm_1.Column)(),
    tslib_1.__metadata("design:type", String)
], InvoiceEntity.prototype, "supplier", void 0);
tslib_1.__decorate([
    (0, typeorm_1.Column)(),
    tslib_1.__metadata("design:type", String)
], InvoiceEntity.prototype, "issueDate", void 0);
tslib_1.__decorate([
    (0, typeorm_1.Column)({ type: 'real' }),
    tslib_1.__metadata("design:type", Number)
], InvoiceEntity.prototype, "amountBeforeVat", void 0);
tslib_1.__decorate([
    (0, typeorm_1.Column)({ type: 'real' }),
    tslib_1.__metadata("design:type", Number)
], InvoiceEntity.prototype, "vatAmount", void 0);
tslib_1.__decorate([
    (0, typeorm_1.Column)({ type: 'real' }),
    tslib_1.__metadata("design:type", Number)
], InvoiceEntity.prototype, "totalAmount", void 0);
tslib_1.__decorate([
    (0, typeorm_1.Column)({ type: 'real' }),
    tslib_1.__metadata("design:type", Number)
], InvoiceEntity.prototype, "cost", void 0);
tslib_1.__decorate([
    (0, typeorm_1.Column)(),
    tslib_1.__metadata("design:type", String)
], InvoiceEntity.prototype, "fileStorageId", void 0);
tslib_1.__decorate([
    (0, typeorm_1.ManyToOne)(() => file_storage_entity_1.FileStorageEntity),
    (0, typeorm_1.JoinColumn)({ name: 'fileStorageId' }),
    tslib_1.__metadata("design:type", typeof (_b = typeof file_storage_entity_1.FileStorageEntity !== "undefined" && file_storage_entity_1.FileStorageEntity) === "function" ? _b : Object)
], InvoiceEntity.prototype, "fileStorage", void 0);
exports.InvoiceEntity = InvoiceEntity = tslib_1.__decorate([
    (0, typeorm_1.Entity)('invoices')
], InvoiceEntity);


/***/ }),
/* 15 */
/***/ ((module) => {

module.exports = require("typeorm");

/***/ }),
/* 16 */
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.API_ENDPOINTS = exports.InvoiceStatus = void 0;
var invoice_status_enum_1 = __webpack_require__(17);
Object.defineProperty(exports, "InvoiceStatus", ({ enumerable: true, get: function () { return invoice_status_enum_1.InvoiceStatus; } }));
var api_endpoints_1 = __webpack_require__(18);
Object.defineProperty(exports, "API_ENDPOINTS", ({ enumerable: true, get: function () { return api_endpoints_1.API_ENDPOINTS; } }));


/***/ }),
/* 17 */
/***/ ((__unused_webpack_module, exports) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.InvoiceStatus = void 0;
exports.InvoiceStatus = {
    APPROVED: 'APPROVED',
    PENDING_APPROVAL: 'PENDING_APPROVAL',
    IN_PROCESS: 'IN_PROCESS',
    REJECTED: 'REJECTED',
};


/***/ }),
/* 18 */
/***/ ((__unused_webpack_module, exports) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.API_ENDPOINTS = void 0;
exports.API_ENDPOINTS = {
    INVOICES: '/api/invoices',
    INVOICE_STATUS_COUNTS: '/api/invoices/status-counts',
    FILES: '/api/files',
};


/***/ }),
/* 19 */
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.FileStorageEntity = void 0;
const tslib_1 = __webpack_require__(1);
const typeorm_1 = __webpack_require__(15);
let FileStorageEntity = class FileStorageEntity {
};
exports.FileStorageEntity = FileStorageEntity;
tslib_1.__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)('uuid'),
    tslib_1.__metadata("design:type", String)
], FileStorageEntity.prototype, "id", void 0);
tslib_1.__decorate([
    (0, typeorm_1.Column)(),
    tslib_1.__metadata("design:type", String)
], FileStorageEntity.prototype, "filename", void 0);
tslib_1.__decorate([
    (0, typeorm_1.Column)(),
    tslib_1.__metadata("design:type", String)
], FileStorageEntity.prototype, "fileLocation", void 0);
exports.FileStorageEntity = FileStorageEntity = tslib_1.__decorate([
    (0, typeorm_1.Entity)('file_storage')
], FileStorageEntity);


/***/ }),
/* 20 */
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {


var _a, _b;
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.InvoiceController = void 0;
const tslib_1 = __webpack_require__(1);
const common_1 = __webpack_require__(2);
const class_transformer_1 = __webpack_require__(21);
const invoice_service_1 = __webpack_require__(22);
const pagination_query_dto_1 = __webpack_require__(24);
const invoice_response_dto_1 = __webpack_require__(26);
const paginated_invoice_response_dto_1 = __webpack_require__(27);
let InvoiceController = class InvoiceController {
    constructor(invoiceService) {
        this.invoiceService = invoiceService;
    }
    async getStatusCounts() {
        return this.invoiceService.getStatusCounts();
    }
    async getById(id) {
        const invoice = await this.invoiceService.getById(id);
        return (0, class_transformer_1.plainToInstance)(invoice_response_dto_1.InvoiceResponseDto, invoice, {
            excludeExtraneousValues: true,
        });
    }
    async findAll(query) {
        const result = await this.invoiceService.findPaginated(query);
        return (0, class_transformer_1.plainToInstance)(paginated_invoice_response_dto_1.PaginatedInvoiceResponseDto, {
            ...result,
            items: result.items.map((item) => (0, class_transformer_1.plainToInstance)(invoice_response_dto_1.InvoiceResponseDto, item, {
                excludeExtraneousValues: true,
            })),
        }, { excludeExtraneousValues: true });
    }
};
exports.InvoiceController = InvoiceController;
tslib_1.__decorate([
    (0, common_1.Get)('status-counts'),
    tslib_1.__metadata("design:type", Function),
    tslib_1.__metadata("design:paramtypes", []),
    tslib_1.__metadata("design:returntype", Promise)
], InvoiceController.prototype, "getStatusCounts", null);
tslib_1.__decorate([
    (0, common_1.Get)(':id'),
    tslib_1.__param(0, (0, common_1.Param)('id')),
    tslib_1.__metadata("design:type", Function),
    tslib_1.__metadata("design:paramtypes", [String]),
    tslib_1.__metadata("design:returntype", Promise)
], InvoiceController.prototype, "getById", null);
tslib_1.__decorate([
    (0, common_1.Get)(),
    tslib_1.__param(0, (0, common_1.Query)()),
    tslib_1.__metadata("design:type", Function),
    tslib_1.__metadata("design:paramtypes", [typeof (_b = typeof pagination_query_dto_1.PaginationQueryDto !== "undefined" && pagination_query_dto_1.PaginationQueryDto) === "function" ? _b : Object]),
    tslib_1.__metadata("design:returntype", Promise)
], InvoiceController.prototype, "findAll", null);
exports.InvoiceController = InvoiceController = tslib_1.__decorate([
    (0, common_1.Controller)('invoices'),
    tslib_1.__metadata("design:paramtypes", [typeof (_a = typeof invoice_service_1.InvoiceService !== "undefined" && invoice_service_1.InvoiceService) === "function" ? _a : Object])
], InvoiceController);


/***/ }),
/* 21 */
/***/ ((module) => {

module.exports = require("class-transformer");

/***/ }),
/* 22 */
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {


var _a;
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.InvoiceService = void 0;
const tslib_1 = __webpack_require__(1);
const common_1 = __webpack_require__(2);
const invoice_repository_1 = __webpack_require__(23);
let InvoiceService = class InvoiceService {
    constructor(invoiceRepository) {
        this.invoiceRepository = invoiceRepository;
    }
    async findPaginated(query) {
        const { items, total } = await this.invoiceRepository.findPaginated(query);
        return {
            items,
            total,
            page: query.page,
            pageSize: query.pageSize,
        };
    }
    async getStatusCounts() {
        return this.invoiceRepository.getStatusCounts();
    }
    async getById(id) {
        const invoice = await this.invoiceRepository.findById(id);
        if (!invoice) {
            throw new common_1.NotFoundException(`Invoice ${id} not found`);
        }
        return invoice;
    }
};
exports.InvoiceService = InvoiceService;
exports.InvoiceService = InvoiceService = tslib_1.__decorate([
    (0, common_1.Injectable)(),
    tslib_1.__metadata("design:paramtypes", [typeof (_a = typeof invoice_repository_1.InvoiceRepository !== "undefined" && invoice_repository_1.InvoiceRepository) === "function" ? _a : Object])
], InvoiceService);


/***/ }),
/* 23 */
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {


var _a;
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.InvoiceRepository = void 0;
const tslib_1 = __webpack_require__(1);
const common_1 = __webpack_require__(2);
const typeorm_1 = __webpack_require__(7);
const typeorm_2 = __webpack_require__(15);
const invoice_entity_1 = __webpack_require__(14);
const shared_1 = __webpack_require__(16);
let InvoiceRepository = class InvoiceRepository {
    constructor(repo) {
        this.repo = repo;
    }
    async findPaginated(query) {
        const qb = this.repo.createQueryBuilder('invoice');
        if (query.search) {
            qb.andWhere('(invoice.description LIKE :search OR invoice.supplier LIKE :search)', { search: `%${query.search}%` });
        }
        if (query.status) {
            qb.andWhere('invoice.status = :status', { status: query.status });
        }
        if (query.dateFrom) {
            qb.andWhere('invoice.issueDate >= :dateFrom', {
                dateFrom: query.dateFrom,
            });
        }
        if (query.dateTo) {
            qb.andWhere('invoice.issueDate <= :dateTo', { dateTo: query.dateTo });
        }
        qb.orderBy('invoice.issueDate', 'DESC');
        qb.skip((query.page - 1) * query.pageSize);
        qb.take(query.pageSize);
        const [items, total] = await qb.getManyAndCount();
        return { items, total };
    }
    async getStatusCounts() {
        const results = await this.repo
            .createQueryBuilder('invoice')
            .select('invoice.status', 'status')
            .addSelect('COUNT(*)', 'count')
            .groupBy('invoice.status')
            .getRawMany();
        const counts = {};
        let all = 0;
        for (const row of results) {
            counts[row.status] = Number(row.count);
            all += Number(row.count);
        }
        return {
            all,
            approved: counts[shared_1.InvoiceStatus.APPROVED] ?? 0,
            pending: counts[shared_1.InvoiceStatus.PENDING_APPROVAL] ?? 0,
            inProcess: counts[shared_1.InvoiceStatus.IN_PROCESS] ?? 0,
            rejected: counts[shared_1.InvoiceStatus.REJECTED] ?? 0,
        };
    }
    async findById(id) {
        return this.repo.findOne({ where: { id } });
    }
};
exports.InvoiceRepository = InvoiceRepository;
exports.InvoiceRepository = InvoiceRepository = tslib_1.__decorate([
    (0, common_1.Injectable)(),
    tslib_1.__param(0, (0, typeorm_1.InjectRepository)(invoice_entity_1.InvoiceEntity)),
    tslib_1.__metadata("design:paramtypes", [typeof (_a = typeof typeorm_2.Repository !== "undefined" && typeorm_2.Repository) === "function" ? _a : Object])
], InvoiceRepository);


/***/ }),
/* 24 */
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {


var _a;
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.PaginationQueryDto = void 0;
const tslib_1 = __webpack_require__(1);
const class_validator_1 = __webpack_require__(25);
const class_transformer_1 = __webpack_require__(21);
const shared_1 = __webpack_require__(16);
class PaginationQueryDto {
    constructor() {
        this.page = 1;
        this.pageSize = 20;
    }
}
exports.PaginationQueryDto = PaginationQueryDto;
tslib_1.__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_transformer_1.Type)(() => Number),
    (0, class_validator_1.IsInt)(),
    (0, class_validator_1.Min)(1),
    tslib_1.__metadata("design:type", Number)
], PaginationQueryDto.prototype, "page", void 0);
tslib_1.__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_transformer_1.Type)(() => Number),
    (0, class_validator_1.IsInt)(),
    (0, class_validator_1.Min)(1),
    tslib_1.__metadata("design:type", Number)
], PaginationQueryDto.prototype, "pageSize", void 0);
tslib_1.__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    tslib_1.__metadata("design:type", String)
], PaginationQueryDto.prototype, "search", void 0);
tslib_1.__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsEnum)(shared_1.InvoiceStatus),
    tslib_1.__metadata("design:type", typeof (_a = typeof shared_1.InvoiceStatus !== "undefined" && shared_1.InvoiceStatus) === "function" ? _a : Object)
], PaginationQueryDto.prototype, "status", void 0);
tslib_1.__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    tslib_1.__metadata("design:type", String)
], PaginationQueryDto.prototype, "dateFrom", void 0);
tslib_1.__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    tslib_1.__metadata("design:type", String)
], PaginationQueryDto.prototype, "dateTo", void 0);


/***/ }),
/* 25 */
/***/ ((module) => {

module.exports = require("class-validator");

/***/ }),
/* 26 */
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {


var _a;
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.InvoiceResponseDto = void 0;
const tslib_1 = __webpack_require__(1);
const class_transformer_1 = __webpack_require__(21);
const shared_1 = __webpack_require__(16);
class InvoiceResponseDto {
}
exports.InvoiceResponseDto = InvoiceResponseDto;
tslib_1.__decorate([
    (0, class_transformer_1.Expose)(),
    tslib_1.__metadata("design:type", String)
], InvoiceResponseDto.prototype, "id", void 0);
tslib_1.__decorate([
    (0, class_transformer_1.Expose)(),
    tslib_1.__metadata("design:type", String)
], InvoiceResponseDto.prototype, "invoiceNumber", void 0);
tslib_1.__decorate([
    (0, class_transformer_1.Expose)(),
    tslib_1.__metadata("design:type", typeof (_a = typeof shared_1.InvoiceStatus !== "undefined" && shared_1.InvoiceStatus) === "function" ? _a : Object)
], InvoiceResponseDto.prototype, "status", void 0);
tslib_1.__decorate([
    (0, class_transformer_1.Expose)(),
    tslib_1.__metadata("design:type", String)
], InvoiceResponseDto.prototype, "description", void 0);
tslib_1.__decorate([
    (0, class_transformer_1.Expose)(),
    tslib_1.__metadata("design:type", String)
], InvoiceResponseDto.prototype, "supplier", void 0);
tslib_1.__decorate([
    (0, class_transformer_1.Expose)(),
    tslib_1.__metadata("design:type", String)
], InvoiceResponseDto.prototype, "issueDate", void 0);
tslib_1.__decorate([
    (0, class_transformer_1.Expose)(),
    tslib_1.__metadata("design:type", Number)
], InvoiceResponseDto.prototype, "amountBeforeVat", void 0);
tslib_1.__decorate([
    (0, class_transformer_1.Expose)(),
    tslib_1.__metadata("design:type", Number)
], InvoiceResponseDto.prototype, "vatAmount", void 0);
tslib_1.__decorate([
    (0, class_transformer_1.Expose)(),
    tslib_1.__metadata("design:type", Number)
], InvoiceResponseDto.prototype, "totalAmount", void 0);
tslib_1.__decorate([
    (0, class_transformer_1.Expose)(),
    tslib_1.__metadata("design:type", Number)
], InvoiceResponseDto.prototype, "cost", void 0);
tslib_1.__decorate([
    (0, class_transformer_1.Expose)(),
    tslib_1.__metadata("design:type", String)
], InvoiceResponseDto.prototype, "fileStorageId", void 0);


/***/ }),
/* 27 */
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.PaginatedInvoiceResponseDto = void 0;
const tslib_1 = __webpack_require__(1);
const class_transformer_1 = __webpack_require__(21);
const invoice_response_dto_1 = __webpack_require__(26);
class PaginatedInvoiceResponseDto {
}
exports.PaginatedInvoiceResponseDto = PaginatedInvoiceResponseDto;
tslib_1.__decorate([
    (0, class_transformer_1.Expose)(),
    (0, class_transformer_1.Type)(() => invoice_response_dto_1.InvoiceResponseDto),
    tslib_1.__metadata("design:type", Array)
], PaginatedInvoiceResponseDto.prototype, "items", void 0);
tslib_1.__decorate([
    (0, class_transformer_1.Expose)(),
    tslib_1.__metadata("design:type", Number)
], PaginatedInvoiceResponseDto.prototype, "total", void 0);
tslib_1.__decorate([
    (0, class_transformer_1.Expose)(),
    tslib_1.__metadata("design:type", Number)
], PaginatedInvoiceResponseDto.prototype, "page", void 0);
tslib_1.__decorate([
    (0, class_transformer_1.Expose)(),
    tslib_1.__metadata("design:type", Number)
], PaginatedInvoiceResponseDto.prototype, "pageSize", void 0);


/***/ }),
/* 28 */
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {


var InvoiceSeeder_1;
var _a, _b, _c, _d;
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.InvoiceSeeder = void 0;
const tslib_1 = __webpack_require__(1);
const common_1 = __webpack_require__(2);
const typeorm_1 = __webpack_require__(7);
const typeorm_2 = __webpack_require__(15);
const invoice_entity_1 = __webpack_require__(14);
const file_storage_service_1 = __webpack_require__(29);
const invoice_pdf_service_1 = __webpack_require__(30);
const storage_provider_interface_1 = __webpack_require__(32);
const shared_1 = __webpack_require__(16);
const SUPPLIERS = [
    'Globex',
    'SkyBridge Tech',
    'DataStream',
    'Veridian Dynamics',
    'Umbrella Ltd',
    'Soylent Corp',
    'Wayne Enterprises',
    'TechNovus',
    'InfraCore',
    'NetPulse',
    'Nakatomi Corp',
    'Initech',
    'Cyberdyne',
    'Massive Dynamic',
];
const DESCRIPTIONS = [
    'Mobile app maintenance',
    'Server hardware upgrade',
    'Data analytics platform',
    'Office renovation',
    'Cybersecurity solutions',
    'Web development project',
    'Equipment leasing',
    'Security audit services',
    'Customer support tools',
    'Design and branding',
    'Legal consulting fees',
    'Network infrastructure',
    'ERP system module',
    'R&D equipment purchase',
];
const STATUSES = [
    shared_1.InvoiceStatus.APPROVED,
    shared_1.InvoiceStatus.PENDING_APPROVAL,
    shared_1.InvoiceStatus.IN_PROCESS,
    shared_1.InvoiceStatus.REJECTED,
];
let InvoiceSeeder = InvoiceSeeder_1 = class InvoiceSeeder {
    constructor(invoiceRepo, fileStorageService, invoicePdfService, storageProvider) {
        this.invoiceRepo = invoiceRepo;
        this.fileStorageService = fileStorageService;
        this.invoicePdfService = invoicePdfService;
        this.storageProvider = storageProvider;
        this.logger = new common_1.Logger(InvoiceSeeder_1.name);
    }
    async onApplicationBootstrap() {
        const existing = await this.invoiceRepo.count();
        if (existing > 0) {
            this.logger.log('Invoices already seeded, skipping.');
            return;
        }
        this.logger.log('Seeding 500 invoices...');
        for (let i = 0; i < 500; i++) {
            const invoiceNumber = `INV-${String(i + 1).padStart(5, '0')}`;
            const status = STATUSES[i % STATUSES.length];
            const supplier = SUPPLIERS[i % SUPPLIERS.length];
            const description = DESCRIPTIONS[i % DESCRIPTIONS.length];
            const issueDate = randomDate();
            const amountBeforeVat = Math.round((Math.random() * 595000 + 5000) * 100) / 100;
            const vatAmount = Math.round(amountBeforeVat * 0.17 * 100) / 100;
            const totalAmount = Math.round((amountBeforeVat + vatAmount) * 100) / 100;
            const cost = totalAmount;
            const filename = `${invoiceNumber}.pdf`;
            const fileLocation = `invoices/${filename}`;
            const fileStorage = await this.fileStorageService.create(filename, fileLocation);
            const invoice = this.invoiceRepo.create({
                invoiceNumber,
                status,
                description,
                supplier,
                issueDate,
                amountBeforeVat,
                vatAmount,
                totalAmount,
                cost,
                fileStorageId: fileStorage.id,
            });
            const saved = await this.invoiceRepo.save(invoice);
            const pdfBuffer = await this.invoicePdfService.generate(saved);
            await this.storageProvider.saveFile(fileLocation, pdfBuffer);
            if ((i + 1) % 100 === 0) {
                this.logger.log(`Seeded ${i + 1}/500 invoices`);
            }
        }
        this.logger.log('Seeding complete.');
    }
};
exports.InvoiceSeeder = InvoiceSeeder;
exports.InvoiceSeeder = InvoiceSeeder = InvoiceSeeder_1 = tslib_1.__decorate([
    (0, common_1.Injectable)(),
    tslib_1.__param(0, (0, typeorm_1.InjectRepository)(invoice_entity_1.InvoiceEntity)),
    tslib_1.__param(3, (0, common_1.Inject)(storage_provider_interface_1.STORAGE_PROVIDER)),
    tslib_1.__metadata("design:paramtypes", [typeof (_a = typeof typeorm_2.Repository !== "undefined" && typeorm_2.Repository) === "function" ? _a : Object, typeof (_b = typeof file_storage_service_1.FileStorageService !== "undefined" && file_storage_service_1.FileStorageService) === "function" ? _b : Object, typeof (_c = typeof invoice_pdf_service_1.InvoicePdfService !== "undefined" && invoice_pdf_service_1.InvoicePdfService) === "function" ? _c : Object, typeof (_d = typeof storage_provider_interface_1.IStorageProvider !== "undefined" && storage_provider_interface_1.IStorageProvider) === "function" ? _d : Object])
], InvoiceSeeder);
function randomDate() {
    const start = new Date(2022, 0, 1).getTime();
    const end = new Date(2026, 11, 31).getTime();
    const date = new Date(start + Math.random() * (end - start));
    const yyyy = date.getFullYear();
    const mm = String(date.getMonth() + 1).padStart(2, '0');
    const dd = String(date.getDate()).padStart(2, '0');
    return `${yyyy}-${mm}-${dd}`;
}


/***/ }),
/* 29 */
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {


var _a;
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.FileStorageService = void 0;
const tslib_1 = __webpack_require__(1);
const common_1 = __webpack_require__(2);
const typeorm_1 = __webpack_require__(7);
const typeorm_2 = __webpack_require__(15);
const file_storage_entity_1 = __webpack_require__(19);
let FileStorageService = class FileStorageService {
    constructor(repo) {
        this.repo = repo;
    }
    async findById(id) {
        const record = await this.repo.findOne({ where: { id } });
        if (!record) {
            throw new common_1.NotFoundException(`File storage record ${id} not found`);
        }
        return record;
    }
    async create(filename, fileLocation) {
        const entity = this.repo.create({ filename, fileLocation });
        return this.repo.save(entity);
    }
};
exports.FileStorageService = FileStorageService;
exports.FileStorageService = FileStorageService = tslib_1.__decorate([
    (0, common_1.Injectable)(),
    tslib_1.__param(0, (0, typeorm_1.InjectRepository)(file_storage_entity_1.FileStorageEntity)),
    tslib_1.__metadata("design:paramtypes", [typeof (_a = typeof typeorm_2.Repository !== "undefined" && typeorm_2.Repository) === "function" ? _a : Object])
], FileStorageService);


/***/ }),
/* 30 */
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.InvoicePdfService = void 0;
const tslib_1 = __webpack_require__(1);
const common_1 = __webpack_require__(2);
const shared_1 = __webpack_require__(16);
const PDFDocument = __webpack_require__(31);
let InvoicePdfService = class InvoicePdfService {
    generate(invoice) {
        return new Promise((resolve, reject) => {
            const doc = new PDFDocument({ size: 'A4', margin: 50 });
            const chunks = [];
            doc.on('data', (chunk) => chunks.push(chunk));
            doc.on('end', () => resolve(Buffer.concat(chunks)));
            doc.on('error', reject);
            const pageWidth = doc.page.width;
            const margin = 50;
            const contentWidth = pageWidth - margin * 2;
            const accentColor = '#ea4335';
            // --- HEADER ---
            doc
                .fontSize(28)
                .font('Helvetica-Bold')
                .text('INVOICE', margin, margin);
            // Company logo (simple triangle/mountain) + name on the right
            const logoX = pageWidth - margin - 80;
            const logoY = margin;
            doc
                .save()
                .moveTo(logoX + 40, logoY)
                .lineTo(logoX + 20, logoY + 30)
                .lineTo(logoX + 60, logoY + 30)
                .closePath()
                .fill(accentColor);
            doc
                .moveTo(logoX + 50, logoY + 10)
                .lineTo(logoX + 35, logoY + 30)
                .lineTo(logoX + 65, logoY + 30)
                .closePath()
                .fill(accentColor);
            doc.restore();
            doc
                .fontSize(10)
                .font('Helvetica-Bold')
                .text('WANDERERS INC.', logoX - 10, logoY + 35, {
                width: 100,
                align: 'center',
            });
            // --- Divider ---
            const dividerY = 110;
            doc
                .moveTo(margin, dividerY)
                .lineTo(pageWidth - margin, dividerY)
                .strokeColor(accentColor)
                .lineWidth(2)
                .stroke();
            // --- BILL TO + Invoice Info ---
            const infoY = 125;
            doc
                .fontSize(10)
                .font('Helvetica-Bold')
                .fillColor('#333333')
                .text('BILL TO:', margin, infoY);
            doc
                .fontSize(9)
                .font('Helvetica')
                .text(invoice.supplier, margin, infoY + 15)
                .text('123 Business Avenue', margin, infoY + 28)
                .text('Tel Aviv, Israel', margin, infoY + 41);
            // Right side: Invoice number + date
            const rightX = pageWidth - margin - 180;
            doc
                .fontSize(10)
                .font('Helvetica-Bold')
                .text('INVOICE NUMBER:', rightX, infoY, { width: 180, align: 'right' });
            doc
                .fontSize(9)
                .font('Helvetica')
                .text(invoice.invoiceNumber, rightX, infoY + 15, {
                width: 180,
                align: 'right',
            });
            doc
                .fontSize(10)
                .font('Helvetica-Bold')
                .text('DATE:', rightX, infoY + 35, { width: 180, align: 'right' });
            doc
                .fontSize(9)
                .font('Helvetica')
                .text(invoice.issueDate, rightX, infoY + 50, {
                width: 180,
                align: 'right',
            });
            // --- Table Header ---
            const tableTop = 220;
            const col1 = margin;
            const col2 = margin + contentWidth * 0.5;
            const col3 = margin + contentWidth * 0.65;
            const col4 = margin + contentWidth * 0.8;
            // Table header background
            doc
                .rect(margin, tableTop, contentWidth, 25)
                .fill(accentColor);
            doc
                .fontSize(9)
                .font('Helvetica-Bold')
                .fillColor('#ffffff')
                .text('DESCRIPTION', col1 + 8, tableTop + 8)
                .text('HOURS', col2, tableTop + 8, { width: 60, align: 'center' })
                .text('PRICE', col3, tableTop + 8, { width: 60, align: 'center' })
                .text('TOTAL', col4, tableTop + 8, { width: 80, align: 'right' });
            // Table row
            const rowY = tableTop + 30;
            doc
                .fillColor('#333333')
                .font('Helvetica')
                .fontSize(9)
                .text(invoice.description, col1 + 8, rowY + 5, {
                width: contentWidth * 0.45,
            })
                .text('--', col2, rowY + 5, { width: 60, align: 'center' })
                .text(formatCurrency(invoice.amountBeforeVat), col3, rowY + 5, { width: 60, align: 'center' })
                .text(formatCurrency(invoice.amountBeforeVat), col4, rowY + 5, { width: 80, align: 'right' });
            // Row divider
            doc
                .moveTo(margin, rowY + 25)
                .lineTo(pageWidth - margin, rowY + 25)
                .strokeColor('#dddddd')
                .lineWidth(0.5)
                .stroke();
            // --- Totals ---
            const totalsY = rowY + 45;
            const totalsX = col3;
            doc
                .fontSize(9)
                .font('Helvetica')
                .fillColor('#333333')
                .text('Subtotal:', totalsX, totalsY, { width: 60 })
                .text(formatCurrency(invoice.amountBeforeVat), col4, totalsY, {
                width: 80,
                align: 'right',
            });
            doc
                .text('VAT (17%):', totalsX, totalsY + 18, { width: 60 })
                .text(formatCurrency(invoice.vatAmount), col4, totalsY + 18, {
                width: 80,
                align: 'right',
            });
            doc
                .moveTo(totalsX, totalsY + 38)
                .lineTo(pageWidth - margin, totalsY + 38)
                .strokeColor(accentColor)
                .lineWidth(1)
                .stroke();
            doc
                .fontSize(11)
                .font('Helvetica-Bold')
                .text('TOTAL:', totalsX, totalsY + 45, { width: 60 })
                .text(formatCurrency(invoice.totalAmount), col4, totalsY + 45, {
                width: 80,
                align: 'right',
            });
            // --- Payment Method ---
            const paymentY = totalsY + 90;
            doc
                .fontSize(10)
                .font('Helvetica-Bold')
                .fillColor('#333333')
                .text('PAYMENT METHOD', margin, paymentY);
            doc
                .fontSize(9)
                .font('Helvetica')
                .text('Bank Transfer / Wire', margin, paymentY + 15)
                .text('Payment due within 30 days of invoice date.', margin, paymentY + 28);
            // --- Notes ---
            const notesY = paymentY + 60;
            doc
                .fontSize(10)
                .font('Helvetica-Bold')
                .text('NOTES', margin, notesY);
            doc
                .fontSize(9)
                .font('Helvetica')
                .text('Please include the invoice number as reference when making payment.', margin, notesY + 15, { width: contentWidth });
            // --- Thank you + Signature ---
            const thankY = notesY + 55;
            doc
                .fontSize(16)
                .font('Helvetica-Bold')
                .fillColor(accentColor)
                .text('Thank you!', margin, thankY);
            const sigY = thankY + 35;
            doc
                .moveTo(margin, sigY)
                .lineTo(margin + 180, sigY)
                .strokeColor('#333333')
                .lineWidth(1)
                .stroke();
            doc
                .fontSize(9)
                .font('Helvetica')
                .fillColor('#333333')
                .text('Authorized Signature', margin, sigY + 5);
            // --- Footer ---
            const footerY = doc.page.height - margin - 20;
            doc
                .fontSize(8)
                .fillColor('#999999')
                .text('www.reallygreatsite.com', margin, footerY, {
                width: contentWidth,
                align: 'center',
            });
            // --- REJECTED watermark ---
            if (invoice.status === shared_1.InvoiceStatus.REJECTED) {
                doc.save();
                doc
                    .fontSize(72)
                    .font('Helvetica-Bold')
                    .fillColor('red')
                    .opacity(0.2)
                    .translate(pageWidth / 2, doc.page.height / 2)
                    .rotate(-45, { origin: [0, 0] })
                    .text('REJECTED', -150, -30);
                doc.restore();
            }
            doc.end();
        });
    }
};
exports.InvoicePdfService = InvoicePdfService;
exports.InvoicePdfService = InvoicePdfService = tslib_1.__decorate([
    (0, common_1.Injectable)()
], InvoicePdfService);
function formatCurrency(amount) {
    return `$${Number(amount).toLocaleString('en-US', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
    })}`;
}


/***/ }),
/* 31 */
/***/ ((module) => {

module.exports = require("pdfkit");

/***/ }),
/* 32 */
/***/ ((__unused_webpack_module, exports) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.STORAGE_PROVIDER = void 0;
exports.STORAGE_PROVIDER = Symbol('STORAGE_PROVIDER');


/***/ }),
/* 33 */
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.FileStorageModule = void 0;
const tslib_1 = __webpack_require__(1);
const common_1 = __webpack_require__(2);
const typeorm_1 = __webpack_require__(7);
const file_storage_entity_1 = __webpack_require__(19);
const invoice_entity_1 = __webpack_require__(14);
const file_storage_service_1 = __webpack_require__(29);
const invoice_pdf_service_1 = __webpack_require__(30);
const local_disk_provider_1 = __webpack_require__(34);
const storage_provider_interface_1 = __webpack_require__(32);
const file_controller_1 = __webpack_require__(37);
let FileStorageModule = class FileStorageModule {
};
exports.FileStorageModule = FileStorageModule;
exports.FileStorageModule = FileStorageModule = tslib_1.__decorate([
    (0, common_1.Module)({
        imports: [typeorm_1.TypeOrmModule.forFeature([file_storage_entity_1.FileStorageEntity, invoice_entity_1.InvoiceEntity])],
        controllers: [file_controller_1.FileController],
        providers: [
            file_storage_service_1.FileStorageService,
            invoice_pdf_service_1.InvoicePdfService,
            { provide: storage_provider_interface_1.STORAGE_PROVIDER, useClass: local_disk_provider_1.LocalDiskProvider },
        ],
        exports: [file_storage_service_1.FileStorageService, invoice_pdf_service_1.InvoicePdfService, storage_provider_interface_1.STORAGE_PROVIDER],
    })
], FileStorageModule);


/***/ }),
/* 34 */
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.LocalDiskProvider = void 0;
const tslib_1 = __webpack_require__(1);
const common_1 = __webpack_require__(2);
const fs = tslib_1.__importStar(__webpack_require__(35));
const path = tslib_1.__importStar(__webpack_require__(36));
let LocalDiskProvider = class LocalDiskProvider {
    constructor() {
        this.storageDir = path.join(process.cwd(), 'storage');
    }
    async getFile(filePath) {
        const fullPath = path.join(this.storageDir, filePath);
        try {
            return fs.readFileSync(fullPath);
        }
        catch {
            return null;
        }
    }
    async saveFile(filePath, buffer) {
        const fullPath = path.join(this.storageDir, filePath);
        const dir = path.dirname(fullPath);
        fs.mkdirSync(dir, { recursive: true });
        fs.writeFileSync(fullPath, buffer);
    }
    async deleteFile(filePath) {
        const fullPath = path.join(this.storageDir, filePath);
        try {
            fs.unlinkSync(fullPath);
        }
        catch {
            // ignore ENOENT
        }
    }
};
exports.LocalDiskProvider = LocalDiskProvider;
exports.LocalDiskProvider = LocalDiskProvider = tslib_1.__decorate([
    (0, common_1.Injectable)()
], LocalDiskProvider);


/***/ }),
/* 35 */
/***/ ((module) => {

module.exports = require("fs");

/***/ }),
/* 36 */
/***/ ((module) => {

module.exports = require("path");

/***/ }),
/* 37 */
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {


var _a, _b, _c, _d, _e;
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.FileController = void 0;
const tslib_1 = __webpack_require__(1);
const common_1 = __webpack_require__(2);
const express_1 = __webpack_require__(38);
const typeorm_1 = __webpack_require__(7);
const typeorm_2 = __webpack_require__(15);
const file_storage_service_1 = __webpack_require__(29);
const invoice_pdf_service_1 = __webpack_require__(30);
const storage_provider_interface_1 = __webpack_require__(32);
const invoice_entity_1 = __webpack_require__(14);
let FileController = class FileController {
    constructor(fileStorageService, invoicePdfService, storageProvider, invoiceRepo) {
        this.fileStorageService = fileStorageService;
        this.invoicePdfService = invoicePdfService;
        this.storageProvider = storageProvider;
        this.invoiceRepo = invoiceRepo;
    }
    async getFile(id, res) {
        const fileRecord = await this.fileStorageService.findById(id);
        let buffer = await this.storageProvider.getFile(fileRecord.fileLocation);
        if (!buffer) {
            // Fallback: regenerate PDF from invoice data
            const invoice = await this.invoiceRepo.findOne({
                where: { fileStorageId: id },
            });
            if (!invoice) {
                throw new common_1.NotFoundException(`Invoice for file ${id} not found`);
            }
            buffer = await this.invoicePdfService.generate(invoice);
            await this.storageProvider.saveFile(fileRecord.fileLocation, buffer);
        }
        res.set({
            'Content-Type': 'application/pdf',
            'Content-Disposition': `inline; filename="${fileRecord.filename}"`,
            'Content-Length': buffer.length,
        });
        res.end(buffer);
    }
};
exports.FileController = FileController;
tslib_1.__decorate([
    (0, common_1.Get)(':id'),
    tslib_1.__param(0, (0, common_1.Param)('id')),
    tslib_1.__param(1, (0, common_1.Res)()),
    tslib_1.__metadata("design:type", Function),
    tslib_1.__metadata("design:paramtypes", [String, typeof (_e = typeof express_1.Response !== "undefined" && express_1.Response) === "function" ? _e : Object]),
    tslib_1.__metadata("design:returntype", Promise)
], FileController.prototype, "getFile", null);
exports.FileController = FileController = tslib_1.__decorate([
    (0, common_1.Controller)('files'),
    tslib_1.__param(2, (0, common_1.Inject)(storage_provider_interface_1.STORAGE_PROVIDER)),
    tslib_1.__param(3, (0, typeorm_1.InjectRepository)(invoice_entity_1.InvoiceEntity)),
    tslib_1.__metadata("design:paramtypes", [typeof (_a = typeof file_storage_service_1.FileStorageService !== "undefined" && file_storage_service_1.FileStorageService) === "function" ? _a : Object, typeof (_b = typeof invoice_pdf_service_1.InvoicePdfService !== "undefined" && invoice_pdf_service_1.InvoicePdfService) === "function" ? _b : Object, typeof (_c = typeof storage_provider_interface_1.IStorageProvider !== "undefined" && storage_provider_interface_1.IStorageProvider) === "function" ? _c : Object, typeof (_d = typeof typeorm_2.Repository !== "undefined" && typeorm_2.Repository) === "function" ? _d : Object])
], FileController);


/***/ }),
/* 38 */
/***/ ((module) => {

module.exports = require("express");

/***/ }),
/* 39 */
/***/ ((module) => {

module.exports = require("@keyv/redis");

/***/ }),
/* 40 */
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.HttpExceptionFilter = void 0;
const tslib_1 = __webpack_require__(1);
const common_1 = __webpack_require__(2);
let HttpExceptionFilter = class HttpExceptionFilter {
    catch(exception, host) {
        const ctx = host.switchToHttp();
        const response = ctx.getResponse();
        const request = ctx.getRequest();
        const status = exception.getStatus?.() ?? common_1.HttpStatus.INTERNAL_SERVER_ERROR;
        const exceptionResponse = exception.getResponse();
        const message = typeof exceptionResponse === 'string'
            ? exceptionResponse
            : exceptionResponse.message ??
                exception.message;
        response.status(status).json({
            statusCode: status,
            message,
            path: request.url,
            timestamp: new Date().toISOString(),
        });
    }
};
exports.HttpExceptionFilter = HttpExceptionFilter;
exports.HttpExceptionFilter = HttpExceptionFilter = tslib_1.__decorate([
    (0, common_1.Catch)(common_1.HttpException)
], HttpExceptionFilter);


/***/ })
/******/ 	]);
/************************************************************************/
/******/ 	// The module cache
/******/ 	var __webpack_module_cache__ = {};
/******/ 	
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/ 		// Check if module is in cache
/******/ 		var cachedModule = __webpack_module_cache__[moduleId];
/******/ 		if (cachedModule !== undefined) {
/******/ 			return cachedModule.exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = __webpack_module_cache__[moduleId] = {
/******/ 			// no module.id needed
/******/ 			// no module.loaded needed
/******/ 			exports: {}
/******/ 		};
/******/ 	
/******/ 		// Execute the module function
/******/ 		__webpack_modules__[moduleId](module, module.exports, __webpack_require__);
/******/ 	
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/ 	
/************************************************************************/
var __webpack_exports__ = {};
// This entry needs to be wrapped in an IIFE because it needs to be isolated against other modules in the chunk.
(() => {
var exports = __webpack_exports__;

Object.defineProperty(exports, "__esModule", ({ value: true }));
const tslib_1 = __webpack_require__(1);
const common_1 = __webpack_require__(2);
const core_1 = __webpack_require__(3);
const nestjs_pino_1 = __webpack_require__(4);
const helmet_1 = tslib_1.__importDefault(__webpack_require__(5));
const app_module_1 = __webpack_require__(6);
const http_exception_filter_1 = __webpack_require__(40);
async function bootstrap() {
    const app = await core_1.NestFactory.create(app_module_1.AppModule, { bufferLogs: true });
    app.useLogger(app.get(nestjs_pino_1.Logger));
    app.setGlobalPrefix('api', {
        exclude: [
            { path: 'health', method: common_1.RequestMethod.GET },
            { path: 'health/live', method: common_1.RequestMethod.GET },
        ],
    });
    app.useGlobalPipes(new common_1.ValidationPipe({ whitelist: true, transform: true }));
    app.useGlobalFilters(new http_exception_filter_1.HttpExceptionFilter());
    app.enableCors();
    app.use((0, helmet_1.default)());
    const port = process.env.PORT || 3000;
    await app.listen(port);
}
bootstrap();

})();

/******/ })()
;
//# sourceMappingURL=main.js.map