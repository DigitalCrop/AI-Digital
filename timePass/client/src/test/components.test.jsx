import React from 'react';
import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { Home } from '../components/Home.jsx';
import { TicTacToe } from '../components/games/TicTacToe.jsx';
import { Lobby } from '../components/Lobby.jsx';

describe('Home',()=>{it('submits a name to create a room',()=>{const create=vi.fn();render(<Home onCreate={create} onJoin={()=>{}}/>);fireEvent.change(screen.getByLabelText(/display name/i),{target:{value:'Maya'}});fireEvent.click(screen.getByRole('button',{name:/create/i}));expect(create).toHaveBeenCalledWith('Maya');});});
describe('TicTacToe',()=>{it('sends only the selected cell',()=>{const move=vi.fn(),state={players:['me','you'],turn:0,status:'playing',board:Array(9).fill(null)};render(<TicTacToe state={state} selfId="me" move={move}/>);fireEvent.click(screen.getByLabelText('Square 1'));expect(move).toHaveBeenCalledWith({cell:0});});});
describe('Lobby',()=>{it('shows connection and host state',()=>{const room={code:'ABCDE',selfId:'p1',selectedGame:null,players:[{id:'p1',name:'Maya',connected:true,ready:false,host:true}]};render(<Lobby room={room} onSelect={()=>{}} onReady={()=>{}} onStart={()=>{}}/>);expect(screen.getByText('Maya')).toBeInTheDocument();expect(screen.getByTitle('Host')).toBeInTheDocument();expect(screen.getByTitle('Connected')).toBeInTheDocument();});});
