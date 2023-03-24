import React, { createContext, useContext, useReducer, useEffect } from "react";
import idGenerator from "./utils/idgenerator";
import cToA from './utils/cToA'

type Status = 'open' | 'closed';
type Modes = 'selection' | 'zoom' | 'default' | 'aligned' | 'mixin';
type Commands = 'random' | 'order' | 'done';

export type FetchedData = {
	'id': string;
	'images': string[];
}

type StateGlobal = {
	command: Commands;
	mode: Modes;
	status: Status;
	mixinLength: string;
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
		mixinLength?: string;
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
	mixinLength: '',
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
		console.log(window)
		console.log(window.location)
		fetch( window.location.href + '/api/')
			.then(response => response.json())
			.then((result:FetchedData[]) => {
				globalDispatch({type: 'update', payload: {
					configurations: result,
					total: result.reduce((previous, current) => previous + current.images.length, 0)
				}})
			})
	}, []);

	useEffect(() => {
		const handleKeyUp = (e: KeyboardEvent) => {
			switch (e.code){
				case  'Digit0' :
				case  'Digit1' :
				case  'Digit2' :
				case  'Digit3' :
				case  'Digit4' :
				case  'Digit5' :
				case  'Digit6' :
				case  'Digit7' :
				case  'Digit8' :
				case  'Digit9' :
					if (globalState.mode !== 'mixin')
						return ;
					globalDispatch({
						type: 'update',
						payload: {
							mixinLength: globalState.mixinLength + cToA(e.code)
						}
					})
					break;
				case 'KeyM':
					globalDispatch({
						type: 'update',
						payload: {
							mode: 'mixin',
							mixinLength:'',
						}
					})
					break;
				case 'KeyA':
				case 'AltLeft':
				case 'AltRight':
					globalDispatch({
						type: 'update',
						payload: {
							mode: 'aligned'
						}
					})
					break;
				case 'Enter':
					let nextConfigurations:FetchedData[] = [];
					let newConfiguration:FetchedData = {id: '', images: []}
					if (globalState.mode === 'mixin'){
						if (!globalState.configurations)
							return ;
						const images = [...globalState.configurations[globalState.currentConfiguration].images];
						const length = parseInt(globalState.mixinLength) > images.length ? images.length : parseInt(globalState.mixinLength);
						const newImages:string[] = [];
						let index = 0;
						while (index < length){
							let randIndex = 0;
							do {
								randIndex = Math.round(Math.random() * (images.length - 1));
							}
							while (newImages.includes(images[randIndex]));
							newImages.push(images[randIndex])
							index += 1;
						}
						nextConfigurations = structuredClone(globalState.configurations);
						newConfiguration = {
							id: idGenerator(4),
							images: newImages
						}
						nextConfigurations.splice(globalState.currentConfiguration + 1, 0, newConfiguration)
					}
					if (globalState.mode === 'selection' && globalState.newConfiguration.length > 0){
						nextConfigurations = structuredClone(globalState.configurations);
						newConfiguration = {
							id: idGenerator(4),
							images: [...globalState.newConfiguration]
						}
						nextConfigurations.splice(globalState.currentConfiguration + 1, 0, newConfiguration)
					}
					if (nextConfigurations.length){
						globalDispatch({
							type: 'update',
							payload: {
								total: nextConfigurations.reduce((previous, current) => previous + current.images.length, 0),
								mode: 'default',
								mixinLength:'',
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
							mode: 'selection',
							mixinLength:'',
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
				case 'Space' :
					if (globalState.mode !== 'default')
						globalDispatch({type: 'update', payload: {
							mode: 'default',
							mixinLength: '',
							newConfiguration: []
						}});
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
		return () => {
			window.removeEventListener('keyup', handleKeyUp);
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