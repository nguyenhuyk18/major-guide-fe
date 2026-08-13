import { instanceCallApi } from './api.setting';

const createChatRoom = (expertId, nameRoom) => instanceCallApi.post('/api/v2/chat-rooms', {
    expertId,
    ...(nameRoom ? { nameRoom } : {})
});

const getMyChatRooms = () => instanceCallApi.get('/api/v2/chat-rooms/me');

const getPrivateMessages = (roomId, page = 1, limit = 30) => instanceCallApi.get(
    `/api/v2/chat-private/rooms/${roomId}`,
    { params: { page, limit } }
);

const sendPrivateMessage = (roomId, content) => instanceCallApi.post('/api/v2/chat-private', {
    roomId,
    content
});

const markPrivateRoomRead = (roomId) => instanceCallApi.patch(`/api/v2/chat-private/rooms/${roomId}/read`);

export {
    createChatRoom,
    getMyChatRooms,
    getPrivateMessages,
    sendPrivateMessage,
    markPrivateRoomRead
};
