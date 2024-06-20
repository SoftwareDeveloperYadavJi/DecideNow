import {
  ArgumentsHost,
  BadRequestException,
  Catch,
  ExceptionFilter,
} from '@nestjs/common';
import { SocketWithAuth } from 'src/polls/types';
import {
  WsBadRequestException,
  WsTypeException,
  WsUnknownException,
} from './ws-exceptions';

@Catch()
export class WsCatchAllFilter implements ExceptionFilter {
  catch(exception: Error, host: ArgumentsHost) {
    const client: SocketWithAuth = host.switchToWs().getClient();

    if (exception instanceof BadRequestException) {
      const exceptionData = exception.getResponse();
      const exceptionMessage =
        exceptionData['message'] ?? exceptionData ?? exception.name;

      const wsException = new WsBadRequestException(exceptionMessage);
      client.emit('exception', wsException.getError());
      return;
    }

    if (exception instanceof WsTypeException) {
      client.emit('exception', exception.getError());
      return;
    }

    const wsException = new WsUnknownException(exception.message);
    client.emit('exception', wsException.getError());
  }
}
