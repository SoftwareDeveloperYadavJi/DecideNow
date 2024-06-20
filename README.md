# DecideNow
DecideNow allows users to create voting rooms, share room codes, add nominations, and conduct real-time voting sessions. Utilizing socket connections, it ensures instant updates for all participants. Simplify decision-making processes in groups with this efficient and interactive tool!

You can try this app out [here](https://decide-now.tech)



## Project Setup

To spin up the container:

1. Use `docker-compose up` from root directory.

To start the server:

1. `cd server`
2. `yarn install`
3. `yarn start:dev`

To start the client:
1. `cd client`
2. `yarn install`
3. `yarn dev`

## Project architecture/working brief:

- In backend we have 4 modules: Config Module, JWT Module, Redis Module and Polls Module
- Polls module has a WebSocketGateway to enable realtime updates of the polls data b/w client and server
- We'll also have REST HTTP API which will be used to make requests to create poll/join poll and when web socket connection fails as a fallback HTTP connection will be used.
- For weighted results of votes, let us use this logic:
  value of nth vote is determined using = ((N - 0.5\*n)/N)^(n+1)
  where N = total votes per participant and n = user's nth preference (choice) from 0 to N-1.
  So, for example if total votes per voter allowed is 3, using the above formula: we calculate the values of each vote of a participant, n=0, i.e. 0th vote is worth 1, n=1 vote is worth 0.6944 and n=2 vote is worth 0.2963. For instance if we have 4 voters, where if 1st voter has candidate A as the first choice, C as second and B as third, the poll results would look like:
  <img width="635" alt="image" src="https://github.com/SoftwareDeveloperYadavJi/decideNow/assets/83968619/10c14a3f-a65e-4b81-b19b-728ce0e4855f">


- On the client side, using valtio for state management due to its simplicity. 
- The participants get updated when our client receives the "poll_updated" event in realtime.

### Web Sockets authorization challenge

To authorize the socket connection requests and to ensure that the event emitted is only visible to the participants of a poll, we have multiple approaches:

1. Using guards for gateways in NestJS. Problem with this is that the we cannot guard against a websocket without actually making a connection to our server via a Guard.

2. In the socketIOAdapter, add an allowRequest method which will do the validations.
   The problems with this approach are:

- Limited Context: Since the allowRequest method only receives a raw web sockets request coming in as HTTP before the WebSocket connection is established, it lacks context about the user or the specific WebSocket connection being requested. This limitation makes it challenging to perform user-specific authorization checks or enforce fine-grained access control.

- Inability to Access Socket or Client: As mentioned, the allowRequest method doesn't have access to the WebSocket connection or the client object, which are typically necessary for performing authorization and filtering events based on participants. Without access to these objects, it's challenging to enforce rules specific to individual connections or clients.

3. Using a middleware - Utilizing middleware functions provided by Socket.IO to handle authorization and validation logic. Middleware can intercept incoming WebSocket events and perform checks before they reach the event handlers, providing more flexibility and context. Let's use this approach.

## Control Flow

1. Admin creates a poll.
2. Participants join poll
3. Participants submit nominations
4. Admin sends "start_poll" event
5. Participants vote
6. admin sends "close_poll" event
7. Server computes results
8. Server sends computed results
9. Participants receive results
