import React, { useState } from 'react';
import { 
  Calendar, MapPin, Clock, Users, Car, Plus, Trash2, Edit2, 
  Check, QrCode, Lock, Unlock, Copy, X, ShieldCheck 
} from 'lucide-react';

export default function App() {
  const [activeTab, setActiveTab] = useState('events');
  
  const [events, setEvents] = useState([
    {
      id: 'cps-axone-2026',
      title: 'CPS - Axone de Montbéliard',
      date: '2026-11-16',
      time: '18:30 - 20:30',
      location: 'Axone, Montbéliard',
      description: 'Entraînement interclub / CPS Judo.',
      attendees: [
        { id: '1', name: 'Lucas Martin', status: 'present', transport: 'autonomous', comment: '' },
        { id: '2', name: 'Thomas Bernard', status: 'present', transport: 'needed', comment: 'Besoin de covoiturage' }
      ]
    }
  ]);

  const [roster, setRoster] = useState([
    { id: 'r1', name: 'Lucas Martin', belt: 'Marron' },
    { id: 'r2', name: 'Thomas Bernard', belt: 'Bleue' },
    { id: 'r3', name: 'Sarah Petit', belt: 'Noire' },
    { id: 'r4', name: 'Kevin Durand', belt: 'Verte' },
    { id: 'r5', name: 'Manon Leroy', belt: 'Marron' }
  ]);

  const [isAdminUnlocked, setIsAdminUnlocked] = useState(false);
  const [adminPin] = useState('2026');
  const [tempPinInput, setTempPinInput] = useState('');
  const [showPinModal, setShowPinModal] = useState(false);
  const [pendingAction, setPendingAction] = useState(null);

  const [selectedEventForModal, setSelectedEventForModal] = useState(null);
  const [selectedJudokaForReg, setSelectedJudokaForReg] = useState('');
  const [customJudokaName, setCustomJudokaName] = useState('');
  const [regStatus, setRegStatus] = useState('present');
  const [regTransport, setRegTransport] = useState('autonomous');
  const [regComment, setRegComment] = useState('');
  const [editingAttendeeId, setEditingAttendeeId] = useState(null);

  const [newEvent, setNewEvent] = useState({ title: '', date: '', time: '', location: '', description: '' });
  const [newMemberName, setNewMemberName] = useState('');
  const [newMemberBelt, setNewMemberBelt] = useState('Blanche');
  const [copiedWhatsApp, setCopiedWhatsApp] = useState(false);
  const [showQrModal, setShowQrModal] = useState(false);

  const handlePinSubmit = (e) => {
    e.preventDefault();
    if (tempPinInput === adminPin) {
      setIsAdminUnlocked(true);
      setShowPinModal(false);
      setTempPinInput('');
      if (pendingAction) {
        pendingAction();
        setPendingAction(null);
      }
    } else {
      alert('Code PIN incorrect (par défaut : 2026)');
    }
  };

  const requestAdminAccess = (action) => {
    if (isAdminUnlocked) {
      action();
    } else {
      setPendingAction(() => action);
      setShowPinModal(true);
    }
  };

  const handleOpenRegisterModal = (event, attendeeToEdit = null) => {
    setSelectedEventForModal(event);
    if (attendeeToEdit) {
      setEditingAttendeeId(attendeeToEdit.id);
      setSelectedJudokaForReg(attendeeToEdit.name);
      setCustomJudokaName(attendeeToEdit.name);
      setRegStatus(attendeeToEdit.status);
      setRegTransport(attendeeToEdit.transport || 'autonomous');
      setRegComment(attendeeToEdit.comment || '');
    } else {
      setEditingAttendeeId(null);
      setSelectedJudokaForReg('');
      setCustomJudokaName('');
      setRegStatus('present');
      setRegTransport('autonomous');
      setRegComment('');
    }
  };

  const handleSaveRegistration = (e) => {
    e.preventDefault();
    const finalName = selectedJudokaForReg === 'AUTRE' ? customJudokaName : selectedJudokaForReg;
    if (!finalName.trim()) return;

    const updatedEvents = events.map(ev => {
      if (ev.id === selectedEventForModal.id) {
        let newAttendees = [...ev.attendees];
        const existingIndex = newAttendees.findIndex(a => a.name.toLowerCase() === finalName.toLowerCase() && a.id !== editingAttendeeId);
        
        const attendeeData = {
          id: editingAttendeeId || Date.now().toString(),
          name: finalName,
          status: regStatus,
          transport: regStatus === 'present' ? regTransport : null,
          comment: regComment
        };

        if (existingIndex >= 0) {
          newAttendees[existingIndex] = attendeeData;
        } else if (editingAttendeeId) {
          newAttendees = newAttendees.map(a => a.id === editingAttendeeId ? attendeeData : a);
        } else {
          newAttendees.push(attendeeData);
        }
        return { ...ev, attendees: newAttendees };
      }
      return ev;
    });

    setEvents(updatedEvents);
    setSelectedEventForModal(null);
  };

  const handleQuickStatusToggle = (eventId, memberName, status, transport = 'autonomous') => {
    const updatedEvents = events.map(ev => {
      if (ev.id === eventId) {
        let newAttendees = [...ev.attendees];
        const idx = newAttendees.findIndex(a => a.name.toLowerCase() === memberName.toLowerCase());
        if (idx >= 0) {
          newAttendees[idx] = { ...newAttendees[idx], status, transport: status === 'present' ? transport : null };
        } else {
          newAttendees.push({ id: Date.now().toString(), name: memberName, status, transport: status === 'present' ? transport : null, comment: '' });
        }
        return { ...ev, attendees: newAttendees };
      }
      return ev;
    });
    setEvents(updatedEvents);
  };

  const handleCreateEvent = (e) => {
    e.preventDefault();
    if (!newEvent.title || !newEvent.date) return;
    setEvents([...events, { id: Date.now().toString(), ...newEvent, attendees: [] }]);
    setNewEvent({ title: '', date: '', time: '', location: '', description: '' });
  };

  const handleDeleteEvent = (eventId) => {
    if (confirm('Supprimer cet événement ?')) {
      setEvents(events.filter(e => e.id !== eventId));
    }
  };

  const handleAddMember = (e) => {
    e.preventDefault();
    if (!newMemberName.trim()) return;
    setRoster([...roster, { id: Date.now().toString(), name: newMemberName, belt: newMemberBelt }]);
    setNewMemberName('');
  };

  const handleDeleteMember = (memberId) => {
    setRoster(roster.filter(m => m.id !== memberId));
  };

  const generateWhatsAppText = (event) => {
    const presents = event.attendees.filter(a => a.status === 'present');
    const absents = event.attendees.filter(a => a.status === 'absent');
    const needed = presents.filter(a => a.transport === 'needed');

    let text = `🥋 *USPV JUDO - ${event.title}*\n`;
    text += `📅 Date : ${event.date} (${event.time})\n`;
    text += `📍 Lieu : ${event.location}\n\n`;
    text += `✅ *Présents (${presents.length}) :*\n`;
    presents.forEach(p => {
      const trans = p.transport === 'needed' ? '🚗 (Demande de transport)' : '🟢 (Déplacement autonome)';
      text += `- ${p.name} ${trans} ${p.comment ? '(' + p.comment + ')' : ''}\n`;
    });
    text += `\n❌ *Absents (${absents.length}) :*\n`;
    absents.forEach(a => { text += `- ${a.name}\n`; });
    text += `\n⚠️ *Besoin de transport :* ${needed.length} judoka(s)\n`;
    return text;
  };

  const copyToWhatsApp = (event) => {
    navigator.clipboard.writeText(generateWhatsAppText(event));
    setCopiedWhatsApp(true);
    setTimeout(() => setCopiedWhatsApp(false), 2500);
  };

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 flex flex-col font-sans">
      <header className="bg-slate-800 border-b border-slate-700 sticky top-0 z-30 shadow-md">
        <div className="max-w-4xl mx-auto px-4 py-3 flex flex-wrap justify-between items-center gap-3">
          <div className="flex items-center space-x-3">
            <div className="bg-red-600 text-white p-2 rounded-xl font-bold flex items-center justify-center shadow-lg">🥋</div>
            <div>
              <h1 className="font-bold text-lg text-white leading-tight">USPV Judo - Ado/Adultes</h1>
              <p className="text-xs text-slate-400">Gestion des présences & transports</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={() => setActiveTab('events')} className={`px-3 py-1.5 rounded-lg text-sm font-medium transition ${activeTab === 'events' ? 'bg-red-600 text-white' : 'bg-slate-700 text-slate-300'}`}>Événements</button>
            <button onClick={() => requestAdminAccess(() => setActiveTab('roster'))} className={`px-3 py-1.5 rounded-lg text-sm font-medium transition flex items-center gap-1.5 ${activeTab === 'roster' ? 'bg-red-600 text-white' : 'bg-slate-700 text-slate-300'}`}><Users className="w-4 h-4" /> Effectif</button>
            <button onClick={() => requestAdminAccess(() => setActiveTab('admin'))} className={`px-3 py-1.5 rounded-lg text-sm font-medium transition flex items-center gap-1.5 ${activeTab === 'admin' ? 'bg-red-600 text-white' : 'bg-slate-700 text-slate-300'}`}><ShieldCheck className="w-4 h-4" /> Resp. Club</button>
            {isAdminUnlocked ? (
              <button onClick={() => setIsAdminUnlocked(false)} className="p-1.5 bg-emerald-600/20 text-emerald-400 border border-emerald-500/30 rounded-lg"><Unlock className="w-4 h-4" /></button>
            ) : (
              <button onClick={() => setShowPinModal(true)} className="p-1.5 bg-slate-700 text-slate-400 hover:text-white rounded-lg"><Lock className="w-4 h-4" /></button>
            )}
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-6 flex-1 w-full">
        {activeTab === 'events' && (
          <div className="space-y-6">
            <div className="flex justify-between items-center bg-slate-800/60 p-4 rounded-xl border border-slate-700/60">
              <div>
                <h2 className="text-lg font-bold text-white">Prochains Sorties & CPS</h2>
                <p className="text-xs text-slate-400">Indiquez votre présence et mode de transport</p>
              </div>
              <button onClick={() => setShowQrModal(true)} className="bg-slate-700 hover:bg-slate-600 text-slate-200 px-3 py-2 rounded-xl text-xs font-medium flex items-center gap-1.5"><QrCode className="w-4 h-4" /> Affiche QR</button>
            </div>

            {events.map(event => {
              const presents = event.attendees.filter(a => a.status === 'present');
              const absents = event.attendees.filter(a => a.status === 'absent');
              const needed = presents.filter(a => a.transport === 'needed');

              return (
                <div key={event.id} className="bg-slate-800 border border-slate-700 rounded-2xl p-5 shadow-lg space-y-5">
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-700/60 pb-4">
                    <div>
                      <span className="bg-red-600/20 text-red-400 border border-red-500/30 text-xs px-2.5 py-1 rounded-full font-semibold uppercase">Sortie Club</span>
                      <h3 className="text-xl font-bold text-white mt-2">{event.title}</h3>
                      <div className="flex flex-wrap items-center gap-4 text-xs text-slate-300 mt-2">
                        <span className="flex items-center gap-1"><Calendar className="w-3.5 h-3.5 text-red-400" /> {event.date}</span>
                        <span className="flex items-center gap-1"><Clock className="w-3.5 h-3.5 text-red-400" /> {event.time}</span>
                        <span className="flex items-center gap-1"><MapPin className="w-3.5 h-3.5 text-red-400" /> {event.location}</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <button onClick={() => copyToWhatsApp(event)} className="bg-emerald-600 hover:bg-emerald-500 text-white px-3.5 py-2 rounded-xl text-xs font-semibold flex items-center gap-1.5 shadow">
                        {copiedWhatsApp ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />} {copiedWhatsApp ? 'Copié !' : 'Récap WhatsApp'}
                      </button>
                      {isAdminUnlocked && (
                        <button onClick={() => handleDeleteEvent(event.id)} className="bg-red-600/20 text-red-400 p-2 rounded-xl"><Trash2 className="w-4 h-4" /></button>
                      )}
                    </div>
                  </div>

                  <button onClick={() => handleOpenRegisterModal(event)} className="w-full bg-red-600 hover:bg-red-500 text-white font-semibold py-3 px-4 rounded-xl text-sm flex items-center justify-center gap-2 shadow-md">
                    <Plus className="w-4 h-4" /> Indiquer ma présence / transport
                  </button>

                  <div className="grid grid-cols-3 gap-3 text-center">
                    <div className="bg-slate-700/50 p-2.5 rounded-xl border border-slate-600/50">
                      <div className="text-lg font-bold text-emerald-400">{presents.length}</div>
                      <div className="text-[11px] text-slate-300">Présents</div>
                    </div>
                    <div className="bg-slate-700/50 p-2.5 rounded-xl border border-slate-600/50">
                      <div className="text-lg font-bold text-amber-400">{needed.length}</div>
                      <div className="text-[11px] text-slate-300">Demandes transport</div>
                    </div>
                    <div className="bg-slate-700/50 p-2.5 rounded-xl border border-slate-600/50">
                      <div className="text-lg font-bold text-slate-400">{absents.length}</div>
                      <div className="text-[11px] text-slate-300">Absents</div>
                    </div>
                  </div>

                  <div className="bg-slate-900/50 rounded-xl p-4 border border-slate-700/50 space-y-3">
                    <h4 className="text-xs font-bold uppercase text-slate-400">Pointage rapide (Tatami)</h4>
                    <div className="space-y-2">
                      {roster.map(member => {
                        const existingReg = event.attendees.find(a => a.name.toLowerCase() === member.name.toLowerCase());
                        const currentStatus = existingReg ? existingReg.status : 'pending';
                        const currentTransport = existingReg ? existingReg.transport : 'autonomous';

                        return (
                          <div key={member.id} className="flex flex-col sm:flex-row sm:items-center justify-between bg-slate-800/80 px-3 py-2 rounded-lg border border-slate-700 gap-2">
                            <div className="flex items-center gap-2">
                              <span className="font-medium text-sm text-white">{member.name}</span>
                              <span className="text-[10px] bg-slate-700 px-1.5 py-0.5 rounded text-slate-300">{member.belt}</span>
                            </div>
                            <div className="flex items-center gap-1.5">
                              <button onClick={() => handleQuickStatusToggle(event.id, member.name, 'present', 'autonomous')} className={`text-xs px-2.5 py-1 rounded-md font-medium ${currentStatus === 'present' && currentTransport === 'autonomous' ? 'bg-emerald-600 text-white' : 'bg-slate-700 text-slate-300'}`}>Autonome</button>
                              <button onClick={() => handleQuickStatusToggle(event.id, member.name, 'present', 'needed')} className={`text-xs px-2.5 py-1 rounded-md font-medium ${currentStatus === 'present' && currentTransport === 'needed' ? 'bg-amber-600 text-white' : 'bg-slate-700 text-slate-300'}`}>Demande transport</button>
                              <button onClick={() => handleQuickStatusToggle(event.id, member.name, 'absent')} className={`text-xs px-2.5 py-1 rounded-md font-medium ${currentStatus === 'absent' ? 'bg-red-600 text-white' : 'bg-slate-700 text-slate-300'}`}>Absent</button>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  <div className="space-y-2 pt-2">
                    <h4 className="text-xs font-bold uppercase text-slate-400">Réponses enregistrées ({event.attendees.length})</h4>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {event.attendees.map(attendee => (
                        <div key={attendee.id} className="bg-slate-900/60 p-3 rounded-xl border border-slate-700/60 flex justify-between items-start">
                          <div>
                            <div className="font-semibold text-sm text-slate-200">{attendee.name}</div>
                            <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium mt-1 inline-block ${attendee.transport === 'needed' ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30' : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'}`}>
                              {attendee.transport === 'needed' ? '🚗 Demande transport' : '🟢 Déplacement autonome'}
                            </span>
                            {attendee.comment && <p className="text-xs text-slate-400 mt-1 italic">"{attendee.comment}"</p>}
                          </div>
                          <button onClick={() => handleOpenRegisterModal(event, attendee)} className="text-slate-400 hover:text-white p-1"><Edit2 className="w-3.5 h-3.5" /></button>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {activeTab === 'roster' && (
          <div className="space-y-6">
            <div className="bg-slate-800 p-5 rounded-2xl border border-slate-700 space-y-4">
              <h2 className="text-lg font-bold text-white flex items-center gap-2"><Users className="w-5 h-5 text-red-500" /> Gestion de l'effectif</h2>
              <form onSubmit={handleAddMember} className="flex flex-col sm:flex-row gap-3">
                <input type="text" placeholder="Prénom et Nom" value={newMemberName} onChange={(e) => setNewMemberName(e.target.value)} className="flex-1 bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-red-500" />
                <select value={newMemberBelt} onChange={(e) => setNewMemberBelt(e.target.value)} className="bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-red-500">
                  <option value="Blanche">Blanche</option><option value="Jaune">Jaune</option><option value="Orange">Orange</option><option value="Verte">Verte</option><option value="Bleue">Bleue</option><option value="Marron">Marron</option><option value="Noire">Noire</option>
                </select>
                <button type="submit" className="bg-red-600 hover:bg-red-500 text-white font-semibold px-4 py-2 rounded-xl text-sm">Ajouter</button>
              </form>
            </div>
            <div className="bg-slate-800 p-5 rounded-2xl border border-slate-700 space-y-3">
              <h3 className="font-bold text-sm text-slate-300">Liste actuelle ({roster.length})</h3>
              {roster.map(m => (
                <div key={m.id} className="flex justify-between items-center bg-slate-900/60 px-4 py-3 rounded-xl border border-slate-700/60">
                  <div><span className="font-semibold text-sm text-white">{m.name}</span><span className="ml-3 text-xs bg-slate-800 px-2 py-0.5 rounded text-slate-300">Ceinture {m.belt}</span></div>
                  <button onClick={() => handleDeleteMember(m.id)} className="text-red-400 hover:text-red-300"><Trash2 className="w-4 h-4" /></button>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'admin' && (
          <div className="bg-slate-800 p-5 rounded-2xl border border-slate-700 space-y-4">
            <h2 className="text-lg font-bold text-white flex items-center gap-2"><Car className="w-5 h-5 text-red-500" /> Nouvel Événement Club</h2>
            <form onSubmit={handleCreateEvent} className="space-y-3">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <input type="text" placeholder="Titre (ex: Tournoi...)" value={newEvent.title} onChange={(e) => setNewEvent({ ...newEvent, title: e.target.value })} required className="bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-red-500" />
                <input type="date" value={newEvent.date} onChange={(e) => setNewEvent({ ...newEvent, date: e.target.value })} required className="bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-red-500" />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <input type="text" placeholder="Horaires (ex: 14h - 18h)" value={newEvent.time} onChange={(e) => setNewEvent({ ...newEvent, time: e.target.value })} className="bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-red-500" />
                <input type="text" placeholder="Lieu" value={newEvent.location} onChange={(e) => setNewEvent({ ...newEvent, location: e.target.value })} className="bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-red-500" />
              </div>
              <button type="submit" className="w-full bg-red-600 hover:bg-red-500 text-white font-semibold py-2.5 rounded-xl text-sm shadow-md">Publier l'événement</button>
            </form>
          </div>
        )}
      </main>

      {selectedEventForModal && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-800 border border-slate-700 rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4">
            <div className="flex justify-between items-center"><h3 className="text-lg font-bold text-white">Indiquer ma participation</h3><button onClick={() => setSelectedEventForModal(null)} className="text-slate-400 hover:text-white"><X className="w-5 h-5" /></button></div>
            <form onSubmit={handleSaveRegistration} className="space-y-4">
              <select value={selectedJudokaForReg} onChange={(e) => { setSelectedJudokaForReg(e.target.value); if (e.target.value !== 'AUTRE') setCustomJudokaName(e.target.value); }} required className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2.5 text-sm text-white focus:outline-none focus:border-red-500">
                <option value="">-- Choisir dans l'effectif --</option>
                {roster.map(m => <option key={m.id} value={m.name}>{m.name} (Ceinture {m.belt})</option>)}
                <option value="AUTRE">+ Saisir un autre nom</option>
              </select>
              {(selectedJudokaForReg === 'AUTRE' || !selectedJudokaForReg) && (
                <input type="text" placeholder="Prénom et Nom" value={customJudokaName} onChange={(e) => { setCustomJudokaName(e.target.value); setSelectedJudokaForReg('AUTRE'); }} required className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2.5 text-sm text-white focus:outline-none focus:border-red-500" />
              )}
              <div className="grid grid-cols-2 gap-3">
                <button type="button" onClick={() => setRegStatus('present')} className={`py-2.5 rounded-xl text-sm font-semibold transition border ${regStatus === 'present' ? 'bg-emerald-600 border-emerald-500 text-white' : 'bg-slate-900 border-slate-700 text-slate-400'}`}>Présent(e)</button>
                <button type="button" onClick={() => setRegStatus('absent')} className={`py-2.5 rounded-xl text-sm font-semibold transition border ${regStatus === 'absent' ? 'bg-red-600 border-red-500 text-white' : 'bg-slate-900 border-slate-700 text-slate-400'}`}>Absent(e)</button>
              </div>
              {regStatus === 'present' && (
                <div className="grid grid-cols-1 gap-2">
                  <button type="button" onClick={() => setRegTransport('autonomous')} className={`p-3 rounded-xl text-left text-xs font-medium border ${regTransport === 'autonomous' ? 'bg-emerald-600/20 border-emerald-500 text-white' : 'bg-slate-900 border-slate-700 text-slate-400'}`}>🟢 Déplacement autonome</button>
                  <button type="button" onClick={() => setRegTransport('needed')} className={`p-3 rounded-xl text-left text-xs font-medium border ${regTransport === 'needed' ? 'bg-amber-600/20 border-amber-500 text-white' : 'bg-slate-900 border-slate-700 text-slate-400'}`}>🚗 Demande de transport</button>
                </div>
              )}
              <input type="text" placeholder="Commentaire (facultatif)" value={regComment} onChange={(e) => setRegComment(e.target.value)} className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-red-500" />
              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setSelectedEventForModal(null)} className="flex-1 bg-slate-700 text-slate-200 py-2.5 rounded-xl text-sm font-semibold">Annuler</button>
                <button type="submit" className="flex-1 bg-red-600 text-white py-2.5 rounded-xl text-sm font-semibold">Enregistrer</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showPinModal && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-800 border border-slate-700 rounded-2xl max-w-xs w-full p-6 shadow-2xl space-y-4 text-center">
            <Lock className="w-6 h-6 mx-auto text-red-400" />
            <h3 className="font-bold text-white">Accès restreint</h3>
            <form onSubmit={handlePinSubmit} className="space-y-3">
              <input type="password" maxLength="4" value={tempPinInput} onChange={(e) => setTempPinInput(e.target.value)} placeholder="••••" autoFocus className="w-full text-center tracking-widest text-lg bg-slate-900 border border-slate-700 rounded-xl py-2.5 text-white" />
              <div className="flex gap-2">
                <button type="button" onClick={() => setShowPinModal(false)} className="flex-1 bg-slate-700 text-slate-200 py-2 rounded-xl text-xs font-semibold">Annuler</button>
                <button type="submit" className="flex-1 bg-red-600 text-white py-2 rounded-xl text-xs font-semibold">Valider</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showQrModal && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-800 border border-slate-700 rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4 text-center">
            <h3 className="text-lg font-bold text-white">Affiche Dojo - QR Code</h3>
            <div className="bg-white p-6 rounded-2xl inline-block">
              <QrCode className="w-24 h-24 mx-auto text-red-600" />
            </div>
            <p className="text-xs text-slate-300 font-mono bg-slate-900 py-2 px-3 rounded-xl border border-slate-700">Lien : https://uspv-cps.vercel.app</p>
            <button onClick={() => setShowQrModal(false)} className="w-full bg-slate-700 text-slate-200 py-2.5 rounded-xl text-sm font-semibold">Fermer</button>
          </div>
        </div>
      )}

      <footer className="bg-slate-800 border-t border-slate-700 py-3 text-center text-xs text-slate-400">USPV Judo • Application de gestion des déplacements & CPS</footer>
    </div>
  );
}