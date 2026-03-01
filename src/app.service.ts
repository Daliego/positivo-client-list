import { Injectable } from '@nestjs/common';
import { clientsListView } from './views/clients-list.view';

@Injectable()
export class AppService {
  getHello(): string {
    return 'Hello World!';
  }

  listClients(): string {
    return clientsListView();
  }
}
