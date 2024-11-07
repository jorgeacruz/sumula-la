import React, { useEffect, useState } from 'react';
import { createClient } from '@supabase/supabase-js';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const supabase = createClient(
  process.env.REACT_APP_SUPABASE_URL,
  process.env.REACT_APP_SUPABASE_ANON_KEY
);

export default function PreAgendado() {
  const [equipes, setEquipes] = useState([]); 
  const [selectedEquipe, setSelectedEquipe] = useState(null);
  const [jogadores, setJogadores] = useState([]);
  const [showModal, setShowModal] = useState(false);
  
  useEffect(() => {
    fetchEquipes();
  }, []);

  const fetchEquipes = async () => {
    try {
      const { data: equipesData, error } = await supabase
        .from('equipes')
        .select(`
          id,
          nome,
          jogadores (
            id,
            nome,
            contato
          )
        `)
        .eq('status', 'pre_agendado');

      if (error) throw error;

      const equipesFormatadas = equipesData.map(equipe => ({
        equipe_id: equipe.id,
        nomeEquipe: equipe.nome,
        nomeJogador: equipe.jogadores[0]?.nome || 'Não informado',
        contato: equipe.jogadores[0]?.contato || 'Não informado'
      }));

      setEquipes(equipesFormatadas);
    } catch (error) {
      console.error('Erro ao buscar dados da equipe:', error);
      toast.error('Erro ao carregar equipes');
    }
  };

  const handleMostrarEquipe = async (equipe) => {
    try {
      const { data: jogadoresData, error } = await supabase
        .from('jogadores')
        .select('nome, contato')
        .eq('equipe_id', equipe.equipe_id);

      if (error) throw error;

      const jogadoresFormatados = jogadoresData.map(jogador => ({
        nomeJogador: jogador.nome,
        contato: jogador.contato
      }));

      setJogadores(jogadoresFormatados);
      setSelectedEquipe(equipe);
      setShowModal(true);
    } catch (error) {
      console.error('Erro ao buscar jogadores da equipe:', error);
      toast.error('Erro ao carregar jogadores da equipe');
    }
  };

  useEffect(() => {
    const handleBeforeUnload = (event) => {
      event.preventDefault();
      event.returnValue = ''; 
    };

    window.addEventListener('beforeunload', handleBeforeUnload);

    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, []);

  return (
    <section className="bg-black text-white p-4 w-full h-screen flex flex-col items-center">
      <ToastContainer />
      <div className="gap-2 flex flex-col lg:flex-row justify-center items-center w-auto">
        <h1 className="text-white text-3xl text-center m-5">Jogos Pre-Agendados</h1> 
      </div>
      <table className="w-full flex flex-col">
        <thead className="bg-primary text-black">
          <tr className="flex justify-around">
            <th className="w-full flex justify-start">Nome da Equipe</th>
            <th className="w-full flex justify-start">Nome do Jogador</th>
            <th className="w-full flex justify-start">Contato</th>
            <th className="w-full flex justify-start">Ação</th>
          </tr>
        </thead>
        <tbody>
          {equipes.length > 0 && equipes.map((equipe, index) => (
            <tr key={index} className="p-1 text-white flex justify-around items-center border border-gray-500">
              <td className="w-full">{equipe.nomeEquipe}</td>
              <td className="w-full">{equipe.nomeJogador}</td>
              <td className="w-full">{equipe.contato}</td>
              <td className="w-full flex gap-2">
                <button
                  className="rounded-md bg-primary p-2 text-black hover:bg-black duration-300 hover:text-white"
                  onClick={() => handleMostrarEquipe(equipe)}
                >
                  Mostrar Equipe
                </button>
                <button 
                  className="rounded-md bg-green-600 p-2 hover:bg-black duration-300"
                  onClick={() => window.location.href = `tel:${equipe.contato}`}
                >
                  Entrar em contato
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-primary w-full max-w-4xl rounded-sm flex flex-col p-5 items-center justify-center">
            <h2 className="text-black font-bold mb-5">Equipe: {selectedEquipe.nomeEquipe}</h2>
            <div className="w-full flex flex-col">
              <div className="w-full flex justify-between px-3">
                <p className="text-black font-semibold w-1/2 text-center">Nome do Jogador</p>
                <p className="text-black font-semibold w-1/2 text-center">Contato</p>
              </div>
              {jogadores.map((jogador, index) => (
                <div key={index} className="w-full flex justify-between items-center px-3 py-2 border-t border-gray-300">
                  <div className="w-1/2 text-center">
                    <p className="text-black font-semibold">{jogador.nomeJogador}</p>
                  </div>
                  <div className="w-1/2 text-center">
                    <p className="text-black font-semibold">{jogador.contato}</p>
                  </div>
                </div>
              ))}
            </div>
            <button
              className="mt-5 p-2 bg-red-600 text-white rounded-md"
              onClick={() => setShowModal(false)}
            >
              Fechar
            </button>
          </div>
        </div>
      )}
    </section>
  );
}
