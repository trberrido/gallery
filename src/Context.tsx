import React, { createContext, useContext, useReducer, useEffect } from "react";
import idGenerator from "./utils/idgenerator";

type Status = 'open' | 'closed';
type Modes = 'selection' | 'zoom' | 'default' | 'aligned';
type Commands = 'random' | 'order' | 'done';

export type FetchedData = {
	'id': string;
	'images': string[];
}

type StateGlobal = {
	command: Commands;
	mode: Modes;
	status: Status;
	newConfiguration: string[];
	currentConfiguration: number;
	currentZoom: number;
	configurations: FetchedData[] | null;
	total: number;
	loaded: number;
}

type Fields = 'loaded' | 'newConfiguration' | 'configurations' | 'currentConfiguration';

type ActionGlobal = {
	type: 'update' | 'increment' | 'push' | 'pop';
	payload: {
		command?: Commands;
		field?: Fields;
		index?: number;
		total?:number;
		loaded?:number;
		mode?: Modes;
		status?: Status;
		item?: string;
		newConfiguration?: string[];
		currentConfiguration?: number;
		currentZoom?: number;
		configurations?: FetchedData[];
	}
}

const initialGlobalState:StateGlobal = {
	status: 'closed',
	mode: 'default',
	command: 'done',
	newConfiguration: [],
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
	if (action.type === 'push'){
		const fieldName = action.payload.field as Fields;
		const updatedField:string[] = structuredClone(state[fieldName]);
		const newElement = action.payload.item as string;
		updatedField.push(newElement)
		return ({
			...state,
			[fieldName]: updatedField
		})
	}
	if (action.type === 'pop'){
		const fieldName = action.payload.field as Fields;
		const targetedArray =  state[fieldName] as string[];
		const popedItem = action.payload.item as string;
		const updatedField:string[] = targetedArray.filter((item) => item !== popedItem);
		return ({
			...state,
			[fieldName]: updatedField
		})
	}
	if (action.type === 'increment'){
		const fieldName = action.payload.field as Fields;
		const updatedField = (state[fieldName] as number) + 1
		return ({
			...state,
			[fieldName]: updatedField
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
			.then((result:FetchedData[]) => {
				globalDispatch({type: 'update', payload: {
					configurations: result,
					total: result.reduce((previous, current) => previous + current.images.length, 0)
				}})
			})
	}, []);

	useEffect(() => {
		const handleKeydown = (e: KeyboardEvent) => {
			switch (e.code){
				case 'ShiftLeft':
				case 'ShiftRight':
					if (globalState.mode === 'selection')
						return ;
					globalDispatch({
						type: 'update',
						payload: {
							mode: 'selection'
						}
					})
					break ;
				case 'KeyA':
				case 'ControlLeft':
				case 'ControlRight':
					if (globalState.mode === 'aligned')
						return ;
					globalDispatch({
						type: 'update',
						payload: {
							mode: 'aligned'
						}
					})
					break;
			}
		}
		const handleKeyUp = (e: KeyboardEvent) => {
			switch (e.code){
				case 'KeyA':
				case 'ControlLeft':
				case 'ControlRight':
					globalDispatch({
						type: 'update',
						payload: {
							mode: 'default'
						}
					})
					break;
				case 'Enter':
					if (globalState.newConfiguration.length > 0){
						const nextConfigurations:FetchedData[] = structuredClone(globalState.configurations);
						const newConfiguration:FetchedData = {
							id: idGenerator(4),
							images: [...globalState.newConfiguration]
						}
						nextConfigurations.splice(globalState.currentConfiguration + 1, 0, newConfiguration)
						globalDispatch({
							type: 'update',
							payload: {
								total: nextConfigurations.reduce((previous, current) => previous + current.images.length, 0),
								mode: 'default',
								configurations: nextConfigurations,
								currentConfiguration: globalState.currentConfiguration + 1,
								newConfiguration: []
							}
						})
					}
					break ;
				case 'KeyR':
					globalDispatch({
						type: 'update',
						payload: {
							command: 'random'
						}
					})
					break ;
				case 'KeyS':
					globalDispatch({
						type: 'update',
						payload: {
							mode: globalState.mode === 'selection' ? 'default' : 'selection'
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
						groupLength = globalState.configurations![globalState.currentConfiguration].images.length
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
				case 'KeyN' :
				case 'KeyB' :
					if (globalState.loaded !== globalState.total)
						return ;
					const newStatus = globalState.status === 'open' ? 'closed' : 'open';
					globalDispatch({type: 'update', payload: { status: newStatus}})
				break;
			}
		};
		window.addEventListener('keyup', handleKeyUp);
		window.addEventListener('keydown', handleKeydown);
		return () => {
			window.removeEventListener('keyup', handleKeyUp);
			window.removeEventListener('keydown', handleKeydown);
		};
	}, [globalState])

	return (
		<GlobalContext.Provider value={{ globalState, globalDispatch }} >
			{ children }
		</GlobalContext.Provider>
	);

}

export const useGlobalContext = () => useContext(GlobalContext);

export default ContextsProvider;