import { Interceptor, NestInterceptor, ExecutionContext, Logger } from '@nestjs/common';
import { Observable } from 'rxjs/Observable';
import 'rxjs/add/operator/do';

@Interceptor()
export class LoggingInterceptor implements NestInterceptor {
    private readonly logger = new Logger('LoggingInterceptor', true);

    intercept(dataOrRequest, context: ExecutionContext, stream$: Observable<any>): Observable<any> {
        const { params, query, originalUrl, method } = dataOrRequest;
        this.logger.log(
            `Receving request ${method} ${originalUrl} with : params: ${JSON.stringify(
                params,
            )}, with query: ${JSON.stringify(query)}`,
        );
        const now = Date.now();
        return stream$.do(() =>
            this.logger.log(
                `Request Receving request ${method} ${originalUrl} took ${Date.now() - now}ms`,
            ),
        );
    }
}
