import { AppService } from './app.service';
export declare class AppController {
    private readonly appService;
    constructor(appService: AppService);
    getHealth(): {
        status: string;
        timestamp: string;
        service: string;
        version: string;
        environment: string;
    };
    getHello(): string;
}
