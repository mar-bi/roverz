/*
 * Group Manager class
 */
import AppUtil from '../lib/util';
import Constants from './constants';

// wrapper class for all groups related db functions
export default class GroupManager {
  constructor(realm) {
    this._realm = realm;
  }

  get list() {
    return this._realm.objects(Constants.Group);
  }

  // ----- simple filters ----
  get sortedList() {
    return this.list.sorted(Constants.LAST_MESSAGE_AT, true);
  }
  get privateList() {
    return this.list.filtered(`type="${Constants.G_PRIVATE}"`);
  }
  get publicList() {
    return this.list.filtered(`type="${Constants.G_PUBLIC}"`);
  }
  get directList() {
    return this.list.filtered(`type="${Constants.G_DIRECT}"`);
  }
  // filter out groups with given names ['a','b']
  // assumption is this list would be very few, don't overload this
  filteredList(groupNames) {
    if (!groupNames || groupNames.length <= 0) return this.list;
    return this.list.filtered(groupNames.map(gname => `name != "${gname}"`).join(' AND '));
  }
  filteredSortedList(groupNames) {
    return this.filteredList(groupNames).sorted(Constants.LAST_MESSAGE_AT, true);
  }
  findById(gid) {
    const res = this.list.filtered(`_id = "${gid}"`);
    return (res && res.length > 0) ? res['0'] : null;
  }
  // case insensitve find (returns only first)
  findByName(gname) {
    const res = this.list.filtered(`name =[c] "${gname}"`);
    return (res && res.length > 0) ? res['0'] : null;
  }
  // search for groups with a given name
  search(gname) {
    return this.list.filtered(`name CONTAINS[c] "${gname}"`);
  }

  // ----- mutation helpers ----

  // add all groups passed {id: {group obj}, id2: {group}}
  addAll(groups) {
    if (!groups || Object.keys(groups).length <= 0) return;
    AppUtil.debug(null, `${Constants.MODULE}: addAll`);
    this._realm.write(() => {
      Object.keys(groups).forEach((k) => {
        let obj = groups[k];
        if (obj && obj._id) {
          let typ = Constants.G_PRIVATE;
          if (obj.type) {
            switch (obj.type) {
              case 'd': typ = Constants.G_DIRECT; break;
              case 'c': typ = Constants.G_PUBLIC; break;
              default: typ = Constants.G_PRIVATE; break;
            }
          }
          obj.type = typ;
          const existingGroup = this.findById(obj._id);
          if (existingGroup) {
            obj.lastMessageAt = existingGroup.lastMessageAt;
            obj.type = existingGroup.type;
          }
          obj = AppUtil.removeEmptyValues(obj);
          AppUtil.debug(obj, null);
          this._realm.create(Constants.Group, obj, true);
        }
      });
    });
  }

  // delete all groups passed {id: {group obj}, id2: {group}}
  deleteGroups(groups) {
    if (!groups || Object.keys(groups).length <= 0) return;
    AppUtil.debug(null, `${Constants.MODULE}: deleteGroups`);
    this._realm.write(() => {
      Object.keys(groups).forEach((k) => {
        var obj = groups[k];
        const existingGroup = this.findById(obj._id);
        if (existingGroup) {
          AppUtil.debug(obj, null);
          this._realm.delete(existingGroup);
        }
      });
    });
  }

  updateNoMoreMessages(group) {
    if (group) {
      const groupToChange = group;
      this._realm.write(() => {
        groupToChange.moreMessages = false;
      });
    }
  }

  addMessage(groupObj, msg) {
    AppUtil.debug(null, `${Constants.MODULE}: addMessage [Group:${groupObj._id},message:${msg}]`);
    this._realm.write(() => {
      const obj = this._realm.create(Constants.Message, { text: msg });
      groupObj.messages.push(obj);
    });
  }

  deleteMessage(groupId, msgId) {
    AppUtil.debug(null, `${Constants.MODULE}: deleteMessage [Group:${groupId},message:${msgId}]`);
    const group = this.findById(groupId);
    if (group) {
      const messageToBeDeleted = group.findMessageById(msgId);
      AppUtil.debug(messageToBeDeleted, null);
      if (messageToBeDeleted) {
        this._realm.write(() => {
          this._realm.delete(messageToBeDeleted);
        });
      }
    }
  }

}
