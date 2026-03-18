import Router from 'koa-router';
import * as clientApiController from '../controllers/clientApi/clientApiController';

const router = new Router({
  prefix: '/clientApi'
});

// Add your client API routes here
router.get('/health', clientApiController.health);
router.get('/widget', clientApiController.getWidgetData);

export default router;
