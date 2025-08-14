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

const client = await init();

const directions: Direction[] = ["right", "down", "left", "up"];
let directionIndex = 0; // 最初は "right"
let lastDirection: Direction | null = null; // 直前の移動方向

// 来た道を引き返さないようにするため、逆方向を計算する関数
function getOppositeDirection(direction: Direction): Direction {
	switch (direction) {
		case "right":
			return "left";
		case "left":
			return "right";
		case "up":
			return "down";
		case "down":
			return "up";
		default:
			// これが実行されることはない
			return "right";
	}
}

// todo: 同じ場所をぐるぐる回らないようにする
function findSafeDirection(
	direction: number,
	readyResult: ReadyResult,
	directions: Direction[],
	lastDirection: Direction | null,
	attempts = 0,
): number {
	// 逆方向を計算しておく
	const oppositeDirection = lastDirection
		? getOppositeDirection(lastDirection)
		: null;
	const oppositeDirectionIndex = oppositeDirection
		? directions.indexOf(oppositeDirection)
		: null;

	if (attempts >= 4) {
		// 全方向を試しても良さそうな道が見つからなかった場合、引き返す
		if (
			oppositeDirection &&
			oppositeDirectionIndex !== null &&
			readyResult[oppositeDirection] !== BLOCK &&
			readyResult[oppositeDirection] !== ENEMY
		) {
			return oppositeDirectionIndex;
		}

		// 逆方向もブロック/敵の場合、敵の方向を選ぶ（敵にブロック仕掛けられたら負ける）
		const ENEMY_DIRECTION = directionOf(ENEMY, readyResult, directions);
		if (ENEMY_DIRECTION !== null) {
			return ENEMY_DIRECTION;
		}

		// 全てブロックに囲まれたら負けのルールなので、いさぎよくブロックにぶつかる(身を投げる)
		return direction;
	}

	const currentDirection = directions[direction];

	// lastDirection が存在し、現在の方向が逆方向の場合は来た道を戻らないようにする
	const isOppositeDirection = currentDirection === oppositeDirection;

	if (
		currentDirection !== undefined &&
		readyResult[currentDirection] !== BLOCK &&
		readyResult[currentDirection] !== ENEMY &&
		!isOppositeDirection
	) {
		return direction;
	}
	// 現在の方向が不適切な場合、次の方向に向いてやり直す
	return findSafeDirection(
		(direction + 1) % 4,
		readyResult,
		directions,
		lastDirection,
		attempts + 1,
	);
}

// ReadyResult の中から特定のセルを探し、その方向を返す
// 見つからなければ null を返す
function directionOf(
	target: Cell,
	readyResult: ReadyResult,
	directions: Direction[],
): number | null {
	for (let i = 0; i < directions.length; i++) {
		const direction = directions[i];
		if (direction !== undefined && readyResult[direction] === target) {
			return i;
		}
	}
	return null;
}

while (true) {
	let readyResult = await client.getReady();
	console.log(readyResult["upLeft"], readyResult["up"], readyResult["upRight"]);
	console.log(readyResult["left"], readyResult["center"], readyResult["right"]);
	console.log(
		readyResult["downLeft"],
		readyResult["down"],
		readyResult["downRight"],
	);
	console.log("-----");

	/* direction を配列にしてシンプルにして、findSafeDirection 関数に切り出して再帰するようにした
  if (direction === "right" && readyResult["right"] === BLOCK) {
    direction = "down";
  }
  if (direction === "down" && readyResult["down"] === BLOCK) {
    direction = "left";
  }
  if (direction === "left" && readyResult["left"] === BLOCK) {
    direction = "up";
  }
  if (direction === "up" && readyResult["up"] === BLOCK) {
    direction = "right";
  }
  */
	// まずはアイテムを探して、あったらその方向を directionIndex にセット
	const itemDirectionIndex = directionOf(ITEM, readyResult, directions);
	if (itemDirectionIndex !== null) {
		directionIndex = itemDirectionIndex;
	} else {
		// アイテムが見つからなかったらブロックや敵のいない方向を directionIndex にセット
		directionIndex = findSafeDirection(
			directionIndex,
			readyResult,
			directions,
			lastDirection,
		);
	}

	const nextDirection = directions[directionIndex];
	if (nextDirection !== undefined) {
		await client.walk(nextDirection);
		lastDirection = nextDirection; // 移動後に lastDirection を更新
	} else {
		throw new Error("Invalid directionIndex: no direction found.");
	}
}
