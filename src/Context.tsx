import React, { createContext, useContext, useReducer, useEffect } from "react";

type Status = 'open' | 'closed';
type Modes = 'selection' | 'zoom' | 'default';
type Options = 'random' | 'ordered';
type Commands = 'random' | 'order' | 'done';

type StateGlobal = {
	command: Commands;
	mode: Modes;
	status: Status;
	option: Options;
	currentConfiguration: number;
	currentZoom: number;
	configurations: string[][] | null;
	total: number;
	loaded: number;
}

type Fields = 'loaded';

type ActionGlobal = {
	type: 'update' | 'increment';
	payload: {
		command?: Commands;
		field?: Fields;
		index?: number;
		total?:number;
		loaded?:number;
		mode?: Modes;
		option?: Options;
		status?: Status;
		currentConfiguration?: number;
		currentZoom?: number;
		configurations?: string[][];
	}
}

const initialGlobalState:StateGlobal = {
	status: 'closed',
	mode: 'default',
	option: 'ordered',
	command: 'done',
	currentConfiguration: 0,
	currentZoom: 0,
	configurations: null,
	total: -1,
	loaded: 0
}

const GlobalContext = createContext<{
	globalState: StateGlobal,
	globalDispatch: React.Dispatch<ActionGlobal>
}>({globalState: initialGlobalState, globalDispatch: () => {}})

const reducer = (state: StateGlobal, action: ActionGlobal):StateGlobal => {
	if (action.type === 'update'){
		return ({
			...state,
			...action.payload
		})
	}
	if (action.type === 'increment'){
		const fieldName = action.payload.field as Fields;
		return ({
			...state,
			[fieldName]: state[fieldName] + 1
		})
	}
	return (state);
}

type Props = {
	children: React.ReactNode
}

const ContextsProvider = ({children}: Props) => {

	const [globalState, globalDispatch] = useReducer(reducer, initialGlobalState);

	useEffect(() => {
		fetch('http://' + window.location.hostname + ':8000/api/')
			.then(response => response.json())
			.then((result:string[][]) => {
				globalDispatch({type: 'update', payload: {
					configurations: result,
					total: result.reduce((previous, current) => previous + current.length, 0)
				}})
			})
	}, []);

	useEffect(() => {
		const handleKeyUp = (e: KeyboardEvent) => {
			switch (e.code){
				case 'KeyR':
					globalDispatch({
						type: 'update',
						payload: {
							command: 'random'
						}
					})
					break ;
				case 'KeyO':
					globalDispatch({
						type: 'update',
						payload: {
							command: 'order'
						}
					})
					break ;
				case 'ArrowLeft' :
				case 'ArrowRight' :
					let groupLength = globalState.configurations!.length
					let nextElement = globalState.currentConfiguration;
					if (globalState.mode === 'zoom'){
						groupLength = globalState.configurations![globalState.currentConfiguration].length
						nextElement = globalState.currentZoom;
					}
					if (e.code === 'ArrowLeft')
						nextElement -= 1;
					if (e.code === 'ArrowRight')
						nextElement += 1;
					if (nextElement < 0)
						nextElement = groupLength - 1;
					if (nextElement === groupLength)
						nextElement = 0;
					if (globalState.mode === 'zoom'){
						globalDispatch({type:'update', payload: {currentZoom: nextElement}})
					} else {
						globalDispatch({type: 'update', payload: { currentConfiguration: nextElement}});
					}
					break;
				case 'Escape' :
					if (globalState.mode === 'zoom')
						globalDispatch({type: 'update', payload: { mode: 'default'}});
				break;
			}
		};
		window.addEventListener('keyup', handleKeyUp);
		return () => window.removeEventListener('keyup', handleKeyUp);
	}, [globalState])

	return (
		<GlobalContext.Provider value={{ globalState, globalDispatch }} >
			{ children }
		</GlobalContext.Provider>
	);

}

export const useGlobalContext = () => useContext(GlobalContext);

export default ContextsProvider;