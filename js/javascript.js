const canvas = document.getElementById('canvas');
let ctx = canvas.getContext('2d');
const tableSize = 25;
let img = new Image(20, 20);
img.src = 'img/apple.png';

let soundDie = new Audio('sounds/die.mp3');
let soundEat = new Audio('sounds/eat.mp3');

class Apple {
    x = 0;
    y = 0;
    color = '#f00';

    randomPosition(freePositions) {
        let pos = Math.floor(Math.random() * freePositions.length);
        pos = freePositions[pos];
        this.x = pos.x;
        this.y = pos.y;
    }
}

function getMousePos(canvas, event) {
    var rect = canvas.getBoundingClientRect();
    return {
        x: event.clientX - rect.left,
        y: event.clientY - rect.top
    };
}
//Function to check whether a point is inside a rectangle
function isInside(pos, rect){
    return pos.x > rect.x && pos.x < rect.x+rect.width && pos.y < rect.y+rect.height && pos.y > rect.y
}

class User {
    x = 0;
    y = 0;
	headColor = '#090';
    color = '#0d0';
    direction = 2;
    tailList = [];
    isAlive = true;
    score = 0;

    update() {
        let prev = {x: this.x, y: this.y}
        for (let i in this.tailList) {
            let tmp = this.tailList[i];
            this.tailList[i] = prev;
            prev = tmp;
        }


        switch (this.direction) {
            case 0:
                this.x -= 1;
                break;
            case 1:
                this.y -= 1;
                break;
            case 2:
                this.x += 1;
                break;
            case 3:
                this.y += 1;
                break;
        }
        this.x = this.loop(this.x);
        this.y = this.loop(this.y);

    }

    loop(value) {
        if (value < 0) {
            soundDie.play();
            user.isAlive = false;
            return 0;
        } else if (value > tableSize - 1) {
            soundDie.play();
            user.isAlive = false;
            return tableSize - 1;
        }
        return value;
    }

    addTail() {
        this.tailList.push({x: this.x, y: this.y});
    }

    getFreePos() {
        let freePos = [];
        for (let x = 0; x < tableSize; x++) {
            for (let y = 0; y < tableSize; y++) {
                let flag = true;
                this.tailList.forEach(function (pos) {
                    if (pos.x == x && pos.y == y) {
                        flag = false;
                    }
                });
                if (this.x == x && this.y == y) {
                    flag = false;
                }
                if (flag) {
                    freePos.push({x: x, y: y});
                }
            }
        }
        return freePos;
    }
}

function  drawRect(x, y, color) {
    const size = 20;
    const padding = 0;

    ctx.beginPath();
    ctx.rect((size+padding)*x, (size+padding)*y, size, size);
    ctx.fillStyle = color;
    ctx.fill();
}

function drawSnake(x, y, color) {
    const size = 20;
    const padding = 0;

    ctx.beginPath();
    ctx.rect((size+padding)*x + 2, (size+padding)*y + 2, size -4, size -4);
    ctx.fillStyle = color;
    ctx.fill();
}

function drawSnakeRest(x, y, color, p, q) {
    const size = 20;
    const padding = 0;

    ctx.beginPath();
    ctx.rect((size+padding)*x + 2 + q, (size+padding)*y + 2 +p, size -4, size -4);
    ctx.fillStyle = color;
    ctx.fill();
}

let user = new User();
let apple = new Apple();
apple.randomPosition(user.getFreePos());

setInterval(function () {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    if (user.isAlive) {

            for (let x = 0; x < tableSize; x++) {
                for (let y = 0; y < tableSize; y++) {
                    drawRect(x, y, '#262626');
                }
            }

            user.update();

			if (user.isAlive) {
				user.tailList.forEach(function (pos) {
					if (pos.x == user.x && pos.y == user.y) {
						soundDie.play();
						user.isAlive = false;
					}
				});
				
				for (let i in user.tailList) {
					let p = user.tailList[i];
					drawSnake(p.x, p.y, user.color);
					
					if (i == 0) {
						if (p.x != user.x) {
							if (p.x > user.x) {
								drawSnakeRest(p.x, p.y, user.color, 0, -4);
							} else {
								drawSnakeRest(p.x, p.y, user.color, 0, 4);
							}
						} else {
							if (p.y > user.y) {
								drawSnakeRest(p.x, p.y, user.color, -4, 0);
							} else {
								drawSnakeRest(p.x, p.y, user.color, 4, 0);
							}
						}
					} else {
						if (p.x != user.tailList[i-1].x) {
							if (p.x > user.tailList[i-1].x) {
								drawSnakeRest(p.x, p.y, user.color, 0, -4);
							} else {
								drawSnakeRest(p.x, p.y, user.color, 0, 4);
							}
						} else {
							if (p.y > user.tailList[i-1].y) {
								drawSnakeRest(p.x, p.y, user.color, -4, 0);
							} else {
								drawSnakeRest(p.x, p.y, user.color, 4, 0);
							}
						}
						
					}
				}
				
				if (user.x === apple.x && user.y === apple.y) {
					soundEat.play();
					user.addTail();
					apple.randomPosition(user.getFreePos());
					user.score++;
				}

				drawSnake(user.x, user.y, user.headColor);
				ctx.drawImage(img, apple.x*20, apple.y*20, img.width, img.height);
				//drawRect(apple.x, apple.y, apple.color);
			}
            ctx.font = "20px Arial";
            ctx.fillStyle = '#fff';
            ctx.fillText("Score: " + user.score, 400, 18);
            ctx.fillText("Highscore: " + document.cookie, 10, 18);
        } else {
            if (document.cookie == "") {
                document.cookie = user.score.toString();
            }
            if (parseInt(document.cookie) < user.score) {
                document.cookie = user.score.toString();
            }
            ctx.font = "20px Arial";
            ctx.fillStyle = '#c00';
            ctx.fillText("YOU DIED", canvas.width*2/4-10, canvas.height/2);
            ctx.font = "20px Arial";
            ctx.fillStyle = '#ccc';
            ctx.fillText("PRESS ANY BUTTON TO RETRY", canvas.width/4, canvas.height*2/3);
            ctx.fillStyle = '#000';
            ctx.fillText("Score: " + user.score, canvas.width*3/4, canvas.height/4);
            ctx.fillText("Highscore: " + document.cookie, canvas.width/4, canvas.height/4);
        }
}, 150);

window.onkeydown = function (event) {
    if (user.isAlive) {
        switch (event.keyCode) {
            case 37:
                if (user.direction != 2) {
                    user.direction = 0;
                }
                break;
            case 65:
                if (user.direction != 2) {
                    user.direction = 0;
                }
                break;
            case 38:
                if (user.direction != 3) {
                    user.direction = 1;
                }
                break;
            case 87:
                if (user.direction != 3) {
                    user.direction = 1;
                }
                break;
            case 39:
                if (user.direction != 0) {
                    user.direction = 2;
                }
                break;
            case 68:
                if (user.direction != 0) {
                    user.direction = 2;
                }
                break;
            case 83:
                if (user.direction != 1) {
                    user.direction = 3;
                }
                break;
            case 40:
                if (user.direction != 1) {
                    user.direction = 3;
                }
                break;
        }
    } else {
        user = new User();
    }
 }

canvas.addEventListener('click', function(evt) {
    var mousePos = getMousePos(canvas, evt);

    if (!user.isAlive) {
        if (isInside(mousePos, {x:canvas.width/4, y: canvas.height*2/3-20, width: 310, height: 20})) {
           user = new User();
        }
    }
}, false);