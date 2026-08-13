import { instanceCallApi } from './api.setting';
const getNotifications = (page = 1, limit = 8, status = '') => instanceCallApi.get('/api/v2/notifications', { params: { page, limit, status } });
const getUnreadCount = () => instanceCallApi.get('/api/v2/notifications/unread-count');
const markNotificationRead = id => instanceCallApi.put(`/api/v2/notifications/${id}/read`);
const markAllNotificationsRead = () => instanceCallApi.put('/api/v2/notifications/read-all');
export { getNotifications, getUnreadCount, markNotificationRead, markAllNotificationsRead };
