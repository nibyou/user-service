import { Injectable } from '@nestjs/common';
import { JsonResponse } from '@nibyou/types';

@Injectable()
export class AppService {
  getHealth(): JsonResponse {
    const asTimeString = (uptime: number) => {
      const uptimeInSeconds = uptime % 60;
      let uptimeInMinutes = Math.floor(uptime / 60);
      let uptimeInHours = Math.floor(uptimeInMinutes / 60);
      const uptimeInDays = Math.floor(uptimeInHours / 24);
      uptimeInHours = uptimeInHours % 24;
      uptimeInMinutes = uptimeInMinutes % 60;
      return `${uptimeInDays}d ${uptimeInHours}h ${uptimeInMinutes}m ${uptimeInSeconds.toFixed(3)}s`;
    };

    return new JsonResponse()
      .setMessage('healthy')
      .setData({ uptime: asTimeString(process.uptime()) });
  }
}
