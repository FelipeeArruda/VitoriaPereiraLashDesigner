import React, { useState, useEffect } from 'react';
import { supabase } from './lib/supabase';
import { getAvailableSlots } from './utils/availability';
import { Sparkles, Calendar, Clock, User, Phone, CheckCircle2, ChevronRight } from 'lucide-react';

export default function App() {
  const [services, setServices] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('Todos');
  const [selectedService, setSelectedService] = useState(null);
  const [selectedDate, setSelectedDate] = useState('');
  const [availableSlots, setAvailableSlots] = useState([]);
  const [selectedTime, setSelectedTime] = useState('');
  const [clientName, setClientName] = useState('');
  const [clientPhone, setClientPhone] = useState('');
  const [isSuccess, setIsSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    async function loadServices() {
      const { data, error } = await supabase
        .from('services')
        .select('*')
        .eq('active', true)
        .order('price', { ascending: true });
      if (data) setServices(data);
    }
    loadServices();
  }, []);

  useEffect(() => {
    async function fetchAvailability() {
      if (!selectedDate || !selectedService) return;
      
      const { data: appointments } = await supabase
        .from('appointments')
        .select('start_time, end_time')
        .eq('status', 'CONFIRMED')
        .gte('start_time', `${selectedDate}T00:00:00`)
        .lte('start_time', `${selectedDate}T23:59:59`);

      const slots = getAvailableSlots(selectedDate, appointments || [], selectedService.duration_minutes);
      setAvailableSlots(slots);
      setSelectedTime('');
    }
    fetchAvailability();
  }, [selectedDate, selectedService]);

  const handleBooking = async (e) => {
    e.preventDefault();
    if (!selectedService || !selectedDate || !selectedTime || !clientName || !clientPhone) return;

    setLoading(true);
    const startDateTime = `${selectedDate}T${selectedTime}:00`;
    const endDateTime = new Date(new Date(startDateTime).getTime() + selectedService.duration_minutes * 60000).toISOString();

    const { error } = await supabase.from('appointments').insert([
      {
        service_id: selectedService.id,
        client_name: clientName,
        client_phone: clientPhone,
        start_time: startDateTime,
        end_time: endDateTime,
        status: 'CONFIRMED'
      }
    ]);

    setLoading(false);
    if (!error) {
      setIsSuccess(true);
      const mensagem = encodeURIComponent(`Olá Vitória! Confirmo o agendamento de ${selectedService.name} para o dia ${selectedDate} às ${selectedTime}. Nome: ${clientName}`);
      window.open(`https://wa.me/558592365528?text=${mensagem}`, '_blank');
    }
  };

  const filteredServices = selectedCategory === 'Todos'
    ? services
    : services.filter(s => s.category === selectedCategory);

  if (isSuccess) {
    return (
      <div className="min-h-screen bg-brand-light flex items-center justify-center p-4">
        <div className="bg-brand-offwhite border border-brand-nude/40 rounded-3xl p-8 max-w-md w-full text-center shadow-lg">
          <CheckCircle2 className="w-16 h-16 text-brand-gold mx-auto mb-4" />
          <h2 className="text-2xl font-serif text-brand-coffee font-semibold mb-2">Horário Reservado!</h2>
          <p className="text-brand-taupe text-sm mb-6 leading-relaxed">
            O seu pedido para <strong className="text-brand-coffee">{selectedService?.name}</strong> foi agendado para o dia <strong className="text-brand-coffee">{selectedDate}</strong> às <strong className="text-brand-coffee">{selectedTime}</strong>.
          </p>
          <button 
            onClick={() => { setIsSuccess(false); setSelectedService(null); setSelectedTime(''); }}
            className="w-full bg-brand-gold text-white font-medium py-3.5 rounded-xl hover:opacity-95 transition-opacity shadow-sm"
          >
            Fazer Novo Agendamento
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-brand-light text-brand-coffee selection:bg-brand-nude/30">
      <header className="bg-brand-light border-b border-brand-nude/30 py-4 px-6 sticky top-0 z-30 shadow-xs">
        <div className="max-w-2xl mx-auto flex justify-center items-center">
          <img src="/logo_sem_sigla.png" alt="Vitória Pereira" className="h-10 md:h-12 object-contain" />
        </div>
      </header>

      <main className="max-w-2xl mx-auto p-4 md:p-6 space-y-8">
        <section>
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-brand-gold" />
              <h2 className="text-base font-serif tracking-wider uppercase text-brand-coffee font-bold">1. Escolha o Procedimento</h2>
            </div>
          </div>

          <div className="flex gap-2 mb-4">
            {['Todos', 'Cílios', 'Sobrancelhas'].map(cat => (
              <button
                key={cat}
                type="button"
                onClick={() => setSelectedCategory(cat)}
                className={`px-4 py-1.5 rounded-full text-xs font-medium transition-all ${
                  selectedCategory === cat
                    ? 'bg-brand-coffee text-brand-light'
                    : 'bg-brand-offwhite text-brand-taupe border border-brand-nude/40 hover:bg-brand-nude/20'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            {filteredServices.map((srv) => (
              <div
                key={srv.id}
                onClick={() => setSelectedService(srv)}
                className={`group rounded-2xl border overflow-hidden cursor-pointer transition-all ${
                  selectedService?.id === srv.id
                    ? 'border-brand-gold bg-brand-offwhite ring-2 ring-brand-gold/60 shadow-md'
                    : 'border-brand-nude/30 bg-brand-offwhite/50 hover:bg-brand-offwhite hover:border-brand-nude'
                }`}
              >
                {srv.image_url && (
                  <div className="h-36 w-full overflow-hidden bg-brand-nude/20">
                    <img 
                      src={srv.image_url} 
                      alt={srv.name} 
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  </div>
                )}
                <div className="p-4">
                  <div className="flex justify-between items-start gap-2 mb-1">
                    <h3 className="font-semibold text-brand-coffee text-sm leading-snug">{srv.name}</h3>
                    <span className="text-brand-gold font-bold text-sm whitespace-nowrap">R$ {Number(srv.price).toFixed(2)}</span>
                  </div>
                  <p className="text-xs text-brand-taupe line-clamp-2 mb-3">{srv.description}</p>
                  <div className="flex items-center gap-1.5 text-[11px] text-brand-taupe font-medium">
                    <Clock className="w-3.5 h-3.5 text-brand-gold" />
                    <span>{srv.duration_minutes} min</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {selectedService && (
          <section className="bg-brand-offwhite p-5 rounded-3xl border border-brand-nude/40 shadow-xs space-y-4">
            <div className="flex items-center gap-2">
              <Calendar className="w-5 h-5 text-brand-gold" />
              <h2 className="text-base font-serif tracking-wider uppercase text-brand-coffee font-bold">2. Escolha a Data e Horário</h2>
            </div>

            <div>
              <label className="block text-xs font-semibold text-brand-taupe mb-1.5">Data Desejada</label>
              <input
                type="date"
                min={new Date().toISOString().split('T')[0]}
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                className="w-full bg-brand-light border border-brand-nude/50 rounded-xl p-3 text-brand-coffee text-sm focus:outline-hidden focus:ring-2 focus:ring-brand-gold"
              />
            </div>

            {selectedDate && (
              <div>
                <label className="block text-xs font-semibold text-brand-taupe mb-2">Horários Livres no Dia</label>
                {availableSlots.length > 0 ? (
                  <div className="grid grid-cols-4 gap-2">
                    {availableSlots.map((slot) => (
                      <button
                        key={slot}
                        type="button"
                        onClick={() => setSelectedTime(slot)}
                        className={`py-2.5 text-xs font-semibold rounded-xl border transition-all ${
                          selectedTime === slot
                            ? 'bg-brand-gold text-white border-brand-gold shadow-xs'
                            : 'bg-brand-light border-brand-nude/40 text-brand-coffee hover:border-brand-gold'
                        }`}
                      >
                        {slot}
                      </button>
                    ))}
                  </div>
                ) : (
                  <p className="text-xs text-brand-taupe bg-brand-light p-3 rounded-xl border border-brand-nude/30">
                    Não existem horários vagos para a duração deste procedimento nesta data.
                  </p>
                )}
              </div>
            )}
          </section>
        )}

        {selectedTime && (
          <form onSubmit={handleBooking} className="bg-brand-offwhite p-5 rounded-3xl border border-brand-nude/40 shadow-xs space-y-4">
            <div className="flex items-center gap-2">
              <User className="w-5 h-5 text-brand-gold" />
              <h2 className="text-base font-serif tracking-wider uppercase text-brand-coffee font-bold">3. Dados de Confirmação</h2>
            </div>

            <div>
              <label className="block text-xs font-semibold text-brand-taupe mb-1">Nome Completo</label>
              <input
                type="text"
                required
                placeholder="Ex: Beatriz Silva"
                value={clientName}
                onChange={(e) => setClientName(e.target.value)}
                className="w-full bg-brand-light border border-brand-nude/50 rounded-xl p-3 text-brand-coffee text-sm focus:outline-hidden focus:ring-2 focus:ring-brand-gold"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-brand-taupe mb-1">Número de WhatsApp</label>
              <input
                type="tel"
                required
                placeholder="(88) 99999-9999"
                value={clientPhone}
                onChange={(e) => setClientPhone(e.target.value)}
                className="w-full bg-brand-light border border-brand-nude/50 rounded-xl p-3 text-brand-coffee text-sm focus:outline-hidden focus:ring-2 focus:ring-brand-gold"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-brand-gold text-white font-semibold py-4 rounded-xl hover:opacity-95 transition-all shadow-md mt-4 flex items-center justify-center gap-2 text-xs uppercase tracking-widest cursor-pointer"
            >
              {loading ? 'A Registar Horário...' : 'Confirmar Agendamento'}
              <ChevronRight className="w-4 h-4" />
            </button>
          </form>
        )}
      </main>
    </div>
  );
}