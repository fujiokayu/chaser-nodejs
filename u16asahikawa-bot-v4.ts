import {
	type Direction,
	EMPTY,
	ENEMY,
	BLOCK,
	ITEM,
	init,
	type ReadyResult,
	type Cell,
} from "./chaser.ts";

enum Funcs {
	None = 0,
	WalkRight = 1,
	WalkLeft = 2,
	WalkUp = 3,
	WalkDown = 4,
	LookRight = 5,
	LookLeft = 6,
	LookUp = 7,
	LookDown = 8,
	SearchRight = 9,
	SearchLeft = 10,
	SearchUp = 11,
	SearchDown = 12,
	PutRight = 13,
	PutLeft = 14,
	PutUp = 15,
	PutDown = 16,
}

interface Point {
	x: number;
	y: number;
}

const Floor = EMPTY;
const Enemy = ENEMY;
const Block = BLOCK;
const Item = ITEM;

let client: Awaited<ReturnType<typeof init>>;

const map = new Map<string, Cell>();
let seed = Date.now();

function getPositionKey(point: Point): string {
	return `${point.x},${point.y}`;
}

function readyResultToArray(result: ReadyResult): Cell[] {
	return [
		result.upLeft,
		result.up,
		result.upRight,
		result.left,
		result.center,
		result.right,
		result.downLeft,
		result.down,
		result.downRight,
	];
}

function mapAdd(pos: Point, value: Cell[]): void {
	const offsetPoints = [
		{ x: -1, y: -1 },
		{ x: 0, y: -1 },
		{ x: 1, y: -1 },
		{ x: -1, y: 0 },
		{ x: 0, y: 0 },
		{ x: 1, y: 0 },
		{ x: -1, y: 1 },
		{ x: 0, y: 1 },
		{ x: 1, y: 1 },
	];

	for (let i = 0; i < offsetPoints.length; i++) {
		const offsetPoint = offsetPoints[i];
		const cellValue = value[i];
		if (offsetPoint && cellValue !== undefined) {
			const newPos = {
				x: pos.x + offsetPoint.x,
				y: pos.y + offsetPoint.y,
			};
			map.set(getPositionKey(newPos), cellValue);
		}
	}
}

function mapAddWithFunc(pos: Point, func: Funcs, value: Cell[]): void {
	let offsetPoints: Point[];

	switch (func) {
		case Funcs.LookUp:
			offsetPoints = [
				{ x: -1, y: -3 },
				{ x: 0, y: -3 },
				{ x: 1, y: -3 },
				{ x: -1, y: -2 },
				{ x: 0, y: -2 },
				{ x: 1, y: -2 },
				{ x: -1, y: -1 },
				{ x: 0, y: -1 },
				{ x: 1, y: -1 },
			];
			break;
		case Funcs.LookDown:
			offsetPoints = [
				{ x: -1, y: 1 },
				{ x: 0, y: 1 },
				{ x: 1, y: 1 },
				{ x: -1, y: 2 },
				{ x: 0, y: 2 },
				{ x: 1, y: 2 },
				{ x: -1, y: 3 },
				{ x: 0, y: 3 },
				{ x: 1, y: 3 },
			];
			break;
		case Funcs.LookRight:
			offsetPoints = [
				{ x: 1, y: -1 },
				{ x: 2, y: -1 },
				{ x: 3, y: -1 },
				{ x: 1, y: 0 },
				{ x: 2, y: 0 },
				{ x: 3, y: 0 },
				{ x: 1, y: 1 },
				{ x: 2, y: 1 },
				{ x: 3, y: 1 },
			];
			break;
		case Funcs.LookLeft:
			offsetPoints = [
				{ x: -3, y: -1 },
				{ x: -2, y: -1 },
				{ x: -1, y: -1 },
				{ x: -3, y: 0 },
				{ x: -2, y: 0 },
				{ x: -1, y: 0 },
				{ x: -3, y: 1 },
				{ x: -2, y: 1 },
				{ x: -1, y: 1 },
			];
			break;
		case Funcs.SearchUp:
			offsetPoints = [
				{ x: 0, y: -1 },
				{ x: 0, y: -2 },
				{ x: 0, y: -3 },
				{ x: 0, y: -4 },
				{ x: 0, y: -5 },
				{ x: 0, y: -6 },
				{ x: 0, y: -7 },
				{ x: 0, y: -8 },
				{ x: 0, y: -9 },
			];
			break;
		case Funcs.SearchDown:
			offsetPoints = [
				{ x: 0, y: 1 },
				{ x: 0, y: 2 },
				{ x: 0, y: 3 },
				{ x: 0, y: 4 },
				{ x: 0, y: 5 },
				{ x: 0, y: 6 },
				{ x: 0, y: 7 },
				{ x: 0, y: 8 },
				{ x: 0, y: 9 },
			];
			break;
		case Funcs.SearchRight:
			offsetPoints = [
				{ x: 1, y: 0 },
				{ x: 2, y: 0 },
				{ x: 3, y: 0 },
				{ x: 4, y: 0 },
				{ x: 5, y: 0 },
				{ x: 6, y: 0 },
				{ x: 7, y: 0 },
				{ x: 8, y: 0 },
				{ x: 9, y: 0 },
			];
			break;
		case Funcs.SearchLeft:
			offsetPoints = [
				{ x: -1, y: 0 },
				{ x: -2, y: 0 },
				{ x: -3, y: 0 },
				{ x: -4, y: 0 },
				{ x: -5, y: 0 },
				{ x: -6, y: 0 },
				{ x: -7, y: 0 },
				{ x: -8, y: 0 },
				{ x: -9, y: 0 },
			];
			break;
		default:
			offsetPoints = [
				{ x: -1, y: -1 },
				{ x: 0, y: -1 },
				{ x: 1, y: -1 },
				{ x: -1, y: 0 },
				{ x: 0, y: 0 },
				{ x: 1, y: 0 },
				{ x: -1, y: 1 },
				{ x: 0, y: 1 },
				{ x: 1, y: 1 },
			];
			break;
	}

	for (let i = 0; i < offsetPoints.length; i++) {
		const offsetPoint = offsetPoints[i];
		const cellValue = value[i];
		if (offsetPoint && cellValue !== undefined) {
			const newPos = {
				x: pos.x + offsetPoint.x,
				y: pos.y + offsetPoint.y,
			};
			map.set(getPositionKey(newPos), cellValue);
		}
	}
}

function move2GetItem(cmd: Funcs, value: Cell[]): boolean {
	if (cmd === Funcs.WalkUp && value[1] === Item) return true;
	if (cmd === Funcs.WalkDown && value[7] === Item) return true;
	if (cmd === Funcs.WalkRight && value[5] === Item) return true;
	if (cmd === Funcs.WalkLeft && value[3] === Item) return true;
	return false;
}

function enemyLocCalcRemoveList(
	direction: number,
	movableLocation: Funcs[],
): Funcs[] {
	const result = [...movableLocation];

	switch (direction) {
		case 0: {
			const leftIndex = result.indexOf(Funcs.WalkLeft);
			if (leftIndex !== -1) result.splice(leftIndex, 1);
			const upIndex = result.indexOf(Funcs.WalkUp);
			if (upIndex !== -1) result.splice(upIndex, 1);
			break;
		}
		case 1:
			if (result.includes(Funcs.WalkUp)) {
				result.splice(result.indexOf(Funcs.WalkUp), 1);
			}
			break;
		case 2:
			if (result.includes(Funcs.WalkUp)) {
				result.splice(result.indexOf(Funcs.WalkUp), 1);
			}
			if (result.includes(Funcs.WalkRight)) {
				result.splice(result.indexOf(Funcs.WalkRight), 1);
			}
			break;
		case 3:
			if (result.includes(Funcs.WalkLeft)) {
				result.splice(result.indexOf(Funcs.WalkLeft), 1);
			}
			break;
		case 4:
			return [];
		case 5:
			if (result.includes(Funcs.WalkRight)) {
				result.splice(result.indexOf(Funcs.WalkRight), 1);
			}
			break;
		case 6:
			if (result.includes(Funcs.WalkLeft)) {
				result.splice(result.indexOf(Funcs.WalkLeft), 1);
			}
			if (result.includes(Funcs.WalkDown)) {
				result.splice(result.indexOf(Funcs.WalkDown), 1);
			}
			break;
		case 7:
			if (result.includes(Funcs.WalkDown)) {
				result.splice(result.indexOf(Funcs.WalkDown), 1);
			}
			break;
		case 8:
			if (result.includes(Funcs.WalkDown)) {
				result.splice(result.indexOf(Funcs.WalkDown), 1);
			}
			if (result.includes(Funcs.WalkRight)) {
				result.splice(result.indexOf(Funcs.WalkRight), 1);
			}
			break;
	}
	return result;
}

function calcRemove(movableLocation: Funcs[], pos: Point): Funcs {
	const firstFunc = movableLocation[0];
	if (firstFunc === undefined) return Funcs.None;

	let bestFunc = firstFunc;
	let minScore = Number.MAX_VALUE;

	for (const moveFunc of movableLocation) {
		let score = 0;
		const distance = 2;
		let targetPos: Point;

		switch (moveFunc) {
			case Funcs.WalkRight:
				targetPos = { x: pos.x + distance, y: pos.y };
				break;
			case Funcs.WalkLeft:
				targetPos = { x: pos.x - distance, y: pos.y };
				break;
			case Funcs.WalkUp:
				targetPos = { x: pos.x, y: pos.y - distance };
				break;
			case Funcs.WalkDown:
				targetPos = { x: pos.x, y: pos.y + distance };
				break;
			default:
				continue;
		}

		if (map.has(getPositionKey(targetPos))) {
			if (map.get(getPositionKey(targetPos)) === Block) score -= 2;
		}

		const aroundPoints = [
			{ x: -1, y: -1 },
			{ x: 0, y: -1 },
			{ x: 1, y: -1 },
			{ x: -1, y: 0 },
			{ x: 0, y: 0 },
			{ x: 1, y: 0 },
			{ x: -1, y: 1 },
			{ x: 0, y: 1 },
			{ x: 1, y: 1 },
		];

		for (const p of aroundPoints) {
			const scanPos = { x: targetPos.x + p.x, y: targetPos.y + p.y };
			if (map.has(getPositionKey(scanPos))) {
				if (map.get(getPositionKey(scanPos)) === Block) score -= 2;
				else score -= 1;
			}
		}

		if (minScore > score) {
			minScore = score;
			bestFunc = moveFunc;
		} else if (minScore === score) {
			const rnd = Math.floor(Math.random() * 2);
			if (rnd !== 0) bestFunc = moveFunc;
		}
	}
	return bestFunc;
}

function calcPos(pos: Point, cmd: Funcs, distance: number): Point {
	const newPos = { x: pos.x, y: pos.y };
	if (cmd === Funcs.WalkUp) newPos.y -= distance;
	if (cmd === Funcs.WalkDown) newPos.y += distance;
	if (cmd === Funcs.WalkRight) newPos.x += distance;
	if (cmd === Funcs.WalkLeft) newPos.x -= distance;
	return newPos;
}

function reverseDirection(cmd: Funcs): Funcs {
	if (cmd === Funcs.WalkUp) return Funcs.WalkDown;
	if (cmd === Funcs.WalkDown) return Funcs.WalkUp;
	if (cmd === Funcs.WalkRight) return Funcs.WalkLeft;
	if (cmd === Funcs.WalkLeft) return Funcs.WalkRight;
	return Funcs.None;
}

function walk2look(cmd: Funcs): Funcs {
	return cmd + 4;
}

function any2walk(cmd: Funcs): Funcs {
	if (cmd > Funcs.SearchDown) return cmd - 12;
	if (cmd > Funcs.LookDown) return cmd - 8;
	if (cmd > Funcs.WalkDown) return cmd - 4;
	return cmd;
}

function enemyCheck(value: Cell[]): Funcs {
	if (value[1] === Enemy) return Funcs.PutUp;
	if (value[3] === Enemy) return Funcs.PutLeft;
	if (value[5] === Enemy) return Funcs.PutRight;
	if (value[7] === Enemy) return Funcs.PutDown;
	return Funcs.None;
}

function cmdNoneCheck(data: Funcs): Funcs {
	if (data === Funcs.None || data > Funcs.PutDown) {
		const rnd = Math.floor(Math.random() * 8) + 5;
		console.log(`None命令が発行されましたので${Funcs[rnd]}を実行しました`);
		return rnd;
	}
	return data;
}

async function func(data: Funcs): Promise<Cell[]> {
	let result: ReadyResult | string;

	switch (data) {
		case Funcs.WalkRight:
			result = await client.walk("right");
			break;
		case Funcs.WalkLeft:
			result = await client.walk("left");
			break;
		case Funcs.WalkUp:
			result = await client.walk("up");
			break;
		case Funcs.WalkDown:
			result = await client.walk("down");
			break;
		case Funcs.LookRight:
			result = await client.look("right");
			break;
		case Funcs.LookLeft:
			result = await client.look("left");
			break;
		case Funcs.LookUp:
			result = await client.look("up");
			break;
		case Funcs.LookDown:
			result = await client.look("down");
			break;
		case Funcs.SearchRight:
			result = await client.search("right");
			break;
		case Funcs.SearchLeft:
			result = await client.search("left");
			break;
		case Funcs.SearchUp:
			result = await client.search("up");
			break;
		case Funcs.SearchDown:
			result = await client.search("down");
			break;
		case Funcs.PutRight:
			result = await client.put("right");
			break;
		case Funcs.PutLeft:
			result = await client.put("left");
			break;
		case Funcs.PutUp:
			result = await client.put("up");
			break;
		case Funcs.PutDown:
			result = await client.put("down");
			break;
		default:
			result = await client.search("up");
			break;
	}

	if (typeof result === "string") {
		return result.split("").slice(0, 9) as Cell[];
	}
	return readyResultToArray(result);
}

async function main() {
	client = await init();

	let turn = 0;
	let stepCount = 0;
	let itemCount = 0;
	let hotokeFace = 0;
	let safe = true;
	let pos: Point = { x: 0, y: 0 };
	const cmdList: Funcs[] = [];
	const posList: Point[] = [pos];
	const actionValue: Cell[][] = [];

	while (true) {
		stepCount++;
		turn++;

		let cmd = Funcs.None;
		const readyResult = await client.getReady();
		const value = readyResultToArray(readyResult);

		mapAdd(pos, value);

		const movableLocation = [
			Funcs.WalkLeft,
			Funcs.WalkUp,
			Funcs.WalkRight,
			Funcs.WalkDown,
		];

		for (let i = 0; i < value.length; i++) {
			if (value[i] === Enemy) {
				if (i === 1 || i === 3 || i === 5 || i === 7) {
					hotokeFace++;
					if (hotokeFace > 1) {
						cmd = enemyCheck(value);
						break;
					}
					if (i === 1 || i === 7) {
						if (value[3] !== Block || value[5] !== Block) {
							if (value[3] === Block && value[5] !== Block)
								cmd = Funcs.WalkRight;
							if (value[3] !== Block && value[5] === Block)
								cmd = Funcs.WalkLeft;
							if (value[3] !== Block && value[5] !== Block) {
								cmd = Math.random() < 0.5 ? Funcs.WalkRight : Funcs.WalkLeft;
							}
						}
					} else {
						if (value[1] !== Block || value[7] !== Block) {
							if (value[1] === Block && value[7] !== Block)
								cmd = Funcs.WalkDown;
							if (value[1] !== Block && value[7] === Block)
								cmd = Funcs.WalkUp;
							if (value[1] !== Block && value[7] !== Block) {
								cmd = Math.random() < 0.5 ? Funcs.WalkDown : Funcs.WalkUp;
							}
						}
					}
				}
				enemyLocCalcRemoveList(i, movableLocation);
			}
		}

		for (let i = 1; i < 8; i += 2) {
			if (value[i] === Block) {
				if (i === 1 && movableLocation.includes(Funcs.WalkUp)) {
					movableLocation.splice(movableLocation.indexOf(Funcs.WalkUp), 1);
				}
				if (i === 3 && movableLocation.includes(Funcs.WalkLeft)) {
					movableLocation.splice(movableLocation.indexOf(Funcs.WalkLeft), 1);
				}
				if (i === 5 && movableLocation.includes(Funcs.WalkRight)) {
					movableLocation.splice(movableLocation.indexOf(Funcs.WalkRight), 1);
				}
				if (i === 7 && movableLocation.includes(Funcs.WalkDown)) {
					movableLocation.splice(movableLocation.indexOf(Funcs.WalkDown), 1);
				}
			}
		}

		if (itemCount * 20 + 20 >= turn) {
			const removeCandidateList: Funcs[] = [];

			for (let i = 1; i < 8; i += 2) {
				if (value[i] === Item) {
					if (i === 1) removeCandidateList.push(Funcs.WalkUp);
					else if (i === 3) removeCandidateList.push(Funcs.WalkLeft);
					else if (i === 5) removeCandidateList.push(Funcs.WalkRight);
					else if (i === 7) removeCandidateList.push(Funcs.WalkDown);
				}
			}

			if (movableLocation.length > 0) {
				if (movableLocation.length === removeCandidateList.length) {
					const randomIndex = Math.floor(
						Math.random() * removeCandidateList.length,
					);
					removeCandidateList.splice(randomIndex, 1);
				}
				for (const remove of removeCandidateList) {
					const index = movableLocation.indexOf(remove);
					if (index !== -1) {
						movableLocation.splice(index, 1);
					}
				}
			}
		}

		try {
			if (cmd === Funcs.None) {
				switch (turn) {
					case 1: {
						const randomMove =
							movableLocation[
								Math.floor(Math.random() * movableLocation.length)
							];
						if (randomMove !== undefined) cmd = randomMove;
						break;
					}
					default: {
						const cmdListLast = cmdList[cmdList.length - 1];
						if (cmdListLast === undefined) break;
						cmd = any2walk(cmdListLast);

						if (Math.random() < 0.9) {
							if (
								movableLocation.length > 1 &&
								cmdListLast > Funcs.WalkDown &&
								cmdListLast < Funcs.SearchRight &&
								safe
							) {
								const actionValueLast = actionValue[actionValue.length - 1];
								if (actionValueLast) {
									for (const val of actionValueLast) {
										if (val === Enemy) {
											const lookToWalk = any2walk(cmdListLast);
											const index = movableLocation.indexOf(lookToWalk);
											if (index !== -1) {
												movableLocation.splice(index, 1);
											}
											safe = false;
											stepCount = -1;
										}
									}
								}
							}
						}

						if (!movableLocation.includes(cmd) || stepCount % 4 === 0) {
							stepCount = 0;

							if (movableLocation.length <= 1) {
								if (movableLocation.length === 1) {
									const firstMove = movableLocation[0];
									if (firstMove !== undefined) cmd = walk2look(firstMove);
								} else {
									cmd = Funcs.None;
								}
							} else {
								const reverseD = reverseDirection(cmdListLast);
								if (
									movableLocation.length > 1 &&
									movableLocation.includes(reverseD)
								) {
									const index = movableLocation.indexOf(reverseD);
									movableLocation.splice(index, 1);
								}

								if (movableLocation.length > 1) {
									if (turn % 2 !== 0) {
										const toRemove = calcRemove(movableLocation, pos);
										const index = movableLocation.indexOf(toRemove);
										if (index !== -1) {
											movableLocation.splice(index, 1);
										}
									} else {
										const randomIndex = Math.floor(
											Math.random() * movableLocation.length,
										);
										movableLocation.splice(randomIndex, 1);
									}
								}

								if (movableLocation.length > 1) {
									const randomMove =
										movableLocation[
											Math.floor(Math.random() * movableLocation.length)
										];
									if (randomMove !== undefined) cmd = randomMove;
								} else {
									const firstMove = movableLocation[0];
									if (firstMove !== undefined) cmd = firstMove;
								}

								if (safe) cmd = walk2look(cmd);
								else safe = true;
							}
						}
						break;
					}
				}
			}
		} catch (error) {
			console.error("Error in main loop:", error);
		}

		if (move2GetItem(cmd, value)) itemCount++;

		cmd = cmdNoneCheck(cmd);

		const result = await func(cmd);

		const lastPos = posList[posList.length - 1];
		if (lastPos) {
			pos = calcPos(lastPos, cmd, 1);
		}

		mapAddWithFunc(pos, cmd, result);

		cmdList.push(cmd);
		posList.push(pos);
		actionValue.push(result);
	}
}

main().catch(console.error);
