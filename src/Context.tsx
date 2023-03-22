import React, { createContext, useContext, useReducer, useEffect } from "react";

type Modes = 'open' | 'closed'

type StateGlobal = {
	mode: Modes;
	currentConfiguration: number;
	configurations: string[][] | null;
	total: number;
	loaded: number;
}

type Fields = 'loaded';

type ActionGlobal = {
	type: 'update' | 'increment';
	payload: {
		field?: Fields;
		total?:number;
		loaded?:number;
		mode?: Modes;
		currentConfiguration?: number;
		configurations?: string[][];
	}
}

const initialGlobalState:StateGlobal = {
	mode: 'closed',
	currentConfiguration: 0,
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
			let nextConfiguration = globalState.currentConfiguration;
			if (e.code === 'ArrowLeft')
				nextConfiguration -= 1;
			if (e.code === 'ArrowRight')
				nextConfiguration += 1;
			if (nextConfiguration < 0)
				nextConfiguration = globalState.configurations!.length - 1;
			if (nextConfiguration === globalState.configurations!.length)
				nextConfiguration = 0;
			globalDispatch({type: 'update', payload: {currentConfiguration: nextConfiguration}});
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