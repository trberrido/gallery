const idGenerator = (length: number) => {
	const availableCharacters = 'ABCDEFGHIJKLMNOPQURSTUVWXZ0123456789_-@#$%&';
	const charactersLength = availableCharacters.length;
	let index = 0;
	let id = '';
	while (index < length){
		id += availableCharacters.charAt(Math.floor(Math.random() * charactersLength))
		index +=1;
	}
	return id;
}

export default idGenerator;