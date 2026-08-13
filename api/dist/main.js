"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const core_1 = require("@nestjs/core");
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const helmet_1 = __importDefault(require("helmet"));
const app_module_1 = require("./app.module");
const http_exception_filter_1 = require("./common/filters/http-exception.filter");
const response_interceptor_1 = require("./common/interceptors/response.interceptor");
const logging_interceptor_1 = require("./common/interceptors/logging.interceptor");
async function bootstrap() {
    const app = await core_1.NestFactory.create(app_module_1.AppModule, {
        logger: ['error', 'warn', 'log', 'debug'],
    });
    app.use((0, helmet_1.default)({
        crossOriginOpenerPolicy: false,
        originAgentCluster: false,
        crossOriginResourcePolicy: { policy: 'cross-origin' },
    }));
    app.enableCors({
        origin: (origin, callback) => {
            if (!origin) {
                callback(null, true);
                return;
            }
            const allowedPattern = /^(https?:\/\/(localhost|127\.0\.0\.1|192\.168\.\d+\.\d+|(.*\.)?nabz\.asia)(:\d+)?)$/;
            if (allowedPattern.test(origin)) {
                callback(null, true);
            }
            else {
                callback(null, false);
            }
        },
        methods: ['GET', 'HEAD', 'PUT', 'PATCH', 'POST', 'DELETE', 'OPTIONS'],
        credentials: true,
        allowedHeaders: ['Content-Type', 'Accept', 'Authorization'],
    });
    app.setGlobalPrefix('api');
    app.enableVersioning({
        type: common_1.VersioningType.URI,
        defaultVersion: '1',
    });
    app.useGlobalPipes(new common_1.ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
        transform: true,
        transformOptions: {
            enableImplicitConversion: true,
        },
    }));
    app.useGlobalFilters(new http_exception_filter_1.HttpExceptionFilter());
    app.useGlobalInterceptors(new logging_interceptor_1.LoggingInterceptor(), new response_interceptor_1.ResponseInterceptor());
    const swaggerConfig = new swagger_1.DocumentBuilder()
        .setTitle('Blood Donation & Emergency Blood Request API')
        .setDescription('Production-ready REST API for a blood donation platform: donor registration, emergency blood requests, automatic compatible-donor matching, and notifications.')
        .setVersion('1.0')
        .addBearerAuth({
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        name: 'JWT',
        description: 'Enter JWT access token',
        in: 'header',
    }, 'access-token')
        .addTag('Auth', 'Authentication and session management')
        .addTag('Users', 'User profile management')
        .addTag('Blood Types', 'Blood type reference data')
        .addTag('Donor Profiles', 'Donor-specific profile management')
        .addTag('Blood Requests', 'Emergency blood requests')
        .addTag('Donors', 'Nearby donor discovery')
        .addTag('Notifications', 'User notifications')
        .build();
    const document = swagger_1.SwaggerModule.createDocument(app, swaggerConfig);
    swagger_1.SwaggerModule.setup('api/docs', app, document, {
        swaggerOptions: {
            persistAuthorization: true,
        },
    });
    const port = process.env.PORT || 3000;
    await app.listen(port, '0.0.0.0');
    console.log(`🩸 Blood Donation API running on: http://0.0.0.0:${port}/api`);
    console.log(`📚 Swagger docs available from host: http://192.168.135.50:${port}/api/docs`);
}
bootstrap();
//# sourceMappingURL=main.js.map