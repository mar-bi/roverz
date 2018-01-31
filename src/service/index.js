/**
 * Chat specific methods/functionality
 *
 * -- This is the business logic layer for chat --
 */
// import { ModuleConfig } from '../constants/';
import Application from '../constants/config';
import AppUtil from '../lib/util';

const MODULE = 'ChatService';
// use cases:
// 1) user sends a message:
//  (a) UI would send message to db
//  (b) this layer that observes DB changes would get the message
//  (c) queues the request to send to backend
// 2) user deletes a message:
//  (a) UI checks permission to delete - from this layer
//  (b) this layer co-ordinates with RC layer to check permissions
//  (c) UI deletes from db
//  (d) this layer observes db changes and would get the change
//  (e) queues the request

class ChatService {
  constructor() {
    if (!ChatService._db && !ChatService._service) {
      ChatService._db = null;
      ChatService._service = null;
    }
  }

  // @todo - do any reinitializations here
  set db(dbHandle) {
    console.log('****** db is set ********');
    ChatService._db = dbHandle;
  }
  get db() {
    return ChatService._db;
  }

  set service(backendService) {
    ChatService._service = backendService;
  }
  get service() {
    return ChatService._service;
  }

  // ---- init section over, service methods follow ----

  // return available channels/groups to display
  get availableChannels() {
    return this.db.groups.filteredSortedList(Application.filterRooms);
  }

  // ---- service actions -----

  // Todo
  // - these can be disabled in UI and can be shown only
  //   only if connectivity present ? - TBD

  // Direct messages (DMs) are private, 1-on-1 conversation between team members. You can
  // think of a DM as a private group with only two members.
  createDirectMessage(userName, cb) {
    this.service.createDirectMessage(userName, cb);
  }

  joinRoom(roomId, cb) {
    this.service.joinRoom(roomId, cb);
  }

  // - presence
  setUserPresence(presenceStatus, cb) {
    this.service.setUserPresence(presenceStatus, (err, res) => {
      AppUtil.debug(res, `${MODULE}: setUserPresence - ${presenceStatus}`);
      if (cb) cb(err, res);
    });
  }
  getUserPresence(state, cb) {
    this.service.getUserPresence(state, (err, res) => {
      AppUtil.debug(res, `${MODULE}: getUserPresence - ${state}`);
      if (cb) cb(err, res);
    });
  }

}

/* Export ==================================================================== */
export default ChatService;
