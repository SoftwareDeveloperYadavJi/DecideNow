import React, { useEffect } from 'react';
import { useSnapshot } from 'valtio';
import { devtools } from 'valtio/utils';
import Loader from './components/ui/Loader';
import SnackBar from './components/ui/SnackBar';

import './index.css';
import Pages from './Pages';
import { actions, state } from './state';
import { getTokenPayload } from './util';

devtools(state, { name: 'app state' });
const App: React.FC = () => {
  const currentState = useSnapshot(state);

  useEffect(() => {
    actions.startLoading();

    const accessToken = localStorage.getItem('accessToken');

    /* if there's no access token, we'll be shown the default
     state.currentPage of AppPage.Welcome */
    if (!accessToken) {
      actions.stopLoading();
      return;
    }

    const { exp: tokenExp } = getTokenPayload(accessToken);
    const currentTimeInSeconds = Date.now() / 1000;

    /* Remove old token if token expiry is within 10 seconds, we'll prevent
     them from connecting (poll will almost be over) since token duration 
     and poll duration are approximately at the same time */
    if (tokenExp < currentTimeInSeconds - 10) {
      localStorage.removeItem('accessToken');
      actions.stopLoading();
      return;
    }

    // reconnect to poll
    actions.setPollAccessToken(accessToken); // needed for socket.io connection
    // socket initialization on server sends updated poll to the client
    actions.initializeSocket();
  }, []);

  useEffect(() => {
    const myID = currentState.me?.id;

    if (
      myID &&
      currentState.socket?.connected &&
      !currentState.poll?.participants[myID]
    ) {
      actions.startOver();
    }
  }, [currentState.poll?.participants]);

  return (
    <>
      <Loader isLoading={currentState.isLoading} color="orange" width={120} />
      {currentState.wsErrors.map((error) => (
        <SnackBar
          key={error.id}
          type="error"
          title={error.type}
          message={error.message}
          show={true}
          onClose={() => actions.removeWsError(error.id)}
          autoCloseDuration={5000}
        />
      ))}
      <Pages />
    </>
  );
};

export default App;
