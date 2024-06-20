import { io, Socket } from 'socket.io-client';
import { AppActions, AppState } from './state';

export const socketIOUrl = `${import.meta.env.VITE_API_URL}/${import.meta.env.VITE_POLLS_NAMESPACE}`;

type CreateSocketOptions = {
  socketIOUrl: string;
  state: AppState;
  actions: AppActions;
};

export const createSocketWithHandlers = ({
  socketIOUrl,
  state,
  actions,
}: CreateSocketOptions): Socket => {
  const socket = io(socketIOUrl, {
    auth: {
      token: state.accessToken,
    },
    transports: ['websocket', 'polling'],
  });

  socket.on('connect', () => {
    console.log(
      `Connected with socket ID: ${socket.id}.`
    );

    actions.stopLoading();
  });

  socket.on('connect_error', () => {
    console.log(`Failed to connect socket`);

    actions.addWsError({
      type: 'Connection Error',
      message: 'Failed to connect to the poll',
    });

    actions.stopLoading();
  });

  socket.on('exception', (error) => {
    console.log('WS exception: ', error);
    actions.addWsError(error);
  });

  socket.on('poll_updated', (poll) => {
    actions.updatePoll(poll);
  });

  return socket;
};
