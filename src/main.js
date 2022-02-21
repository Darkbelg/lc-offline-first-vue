import {createApp} from 'vue'
import App from './App.vue'
import './app.css'
import './registerServiceWorker'

import {createStore} from 'vuex'

const store = createStore({
    state() {
        return {
            editor: null,
            database: null,
            notes: [],
            activeNote: {},
            isOffline: !navigator.onLine
        }
    }
    ,
    mutations: {
        updateEditor(state, editor) {
            state.editor = editor;
        },
        updateDatabase(state, database) {
            state.database = database;
        },
        updateNotes(state, notes) {
            state.notes = notes;
        },
        updateActiveNote(state, note) {
            state.activeNote = note
        },
        updateIsOffline(state, isOffline) {
            state.isOffline = isOffline
        }
    }
    ,
    actions: {
        init({dispatch}) {
            dispatch('initDatabase').then(() => {
                dispatch('initNotes');
            }).catch((e) => {
                console.error(e)
            });
        },
        initDatabase({commit}) {
            return new Promise((resolve, reject) => {
                //initialize the database
                let db = window.indexedDB.open("notes",2);
                // Do it to upgrade a excisting database
                //let db = window.indexedDB.open("notes", 2) ;

                db.onerror = e => {
                    console.error('Error opening the database');
                };
                //Is the same as:
                //db.onerror = function (e) { }

                db.onsuccess = e => {
                    console.log('db.onsuccess', e);
                    commit('updateDatabase', e.target.result);
                    resolve('test');
                };

                db.onupgradeneeded = e => {
                    console.log('db.onupgradeneeded', e);

                    if (e.oldVersion === 1) {
                        e.target.result.deleteObjectStore("notes");
                    }
                    //only use when upgrading database. Can't delete what you don't have
                    // e.target.result.deleteObjectStore("notes");
                    e.target.result.createObjectStore("notes", {keyPath: "created"});
                };
            })
        },
        initNotes({commit, state}) {
            // initialize the notes array
            let notes = state.database.transaction('notes')
                .objectStore('notes')
                .getAll();
            notes.onsuccess = e => {
                console.log('getNotes()', e.target.result);
                commit('updateNotes', e.target.result);

            };
            notes.onerror = e => {
                console.log('failed getting the notes');
            }
        },
        saveNote({commit, state}) {
            let noteStore = state.database.transaction('notes', 'readwrite')
                .objectStore('notes');
            let noteRequest = noteStore.get(state.activeNote.created);

            noteRequest.onerror = e => {
                console.error('Error saving the note in the database.');
            }

            noteRequest.onsuccess = e => {
                let note = e.target.result;
                note.content = state.editor.getHTML();

                let updateRequest = noteStore.put(note);

                updateRequest.onerror = e => {
                    console.error('Error storing the updated note in the database.');
                };

                updateRequest.onsuccess = e => {
                    let notes = state.notes;
                    let noteIndex = notes.findIndex(n => n.created === note.created);
                    notes[noteIndex] = note;
                    commit('updateNotes', notes);
                };
            }
        },
        addNewNote({commit, state}) {
            let transaction = state.database.transaction("notes", "readwrite");

            let now = new Date();
            let note = {
                content: '',
                created: now.getTime()
            };
            // add that same note to the sidebar
            let notes = state.notes;
            notes.unshift(note);
            commit('updateNotes', notes);

            // set the activeNote as the new note
            commit('updateActiveNote', note);

            transaction.objectStore("notes").add(note);
        },
        destroyEditor({commit, state}) {
            state.editor.destroy();
            commit('updateEditor', null);
        }
    }
})

createApp(App).use(store).mount('#app')

store.dispatch('init')
