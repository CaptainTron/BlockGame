// Adding documentation to this code
// this method will fire when all the pages has been loaded !
window.addEventListener('load',function(){
    const canvas = document.getElementById('canvas1');
    const ctx = canvas.getContext('2d');
    canvas.width = 500;
    canvas.height = 500;

    // this class will handle inputs from the user
    // IT will take care of all the input from keyboard for the user !!!
    class InputHandler {
        constructor(game){
            // making the game object properties in the game
            this.game = game;
            // this method will listen the keydown event
            window.addEventListener('keydown', e => {
                if((e.key === 'ArrowUp' || e.key === 'ArrowDown') && (this.game.keys.push(e.key)=== -1)) {
                    this.game.keys.push(e.key);
                }else if(e.key === ' '){
                    this.game.player.shoottop();
                }
                console.log(this.game.keys);
            });
            window.addEventListener('keyup', e => {
                if(this.game.keys.indexOf(e.key) > -1) {
                   this.game.keys.splice(this.game.keys.indexOf(e.key), 1);
                }
                console.log(this.game.keys);
            });
        }
    }
    // This method will handle the ammo of the player when shooted from the top of page
    class Projectile{
        constructor(game,x,y){
            this.game = game;
            this.x = x;
            this.y = y;
            this.width = 20;
            this.height = 3;
            this.speed = 6;
            this.markedForDeletion = false;
        }
        update(){
            this.x+=this.speed;
            if(this.x > this.game.width) 
            this.markedForDeletion = true;
        }
        draw(context)
        {
            context.fillStyle = 'yellow';
            context.fillRect(this.x,this.y,this.width,this.height);
        }

    }
    class Player{
        constructor(game){
            this.game = game;
            this.width = 90;
            this.height = 150;
            this.x = 5;
            this.y = 150;
            this.speedY = 0;
            this.max_speed = 5;
            this.projectiles = [];  
        }
        update(){
            if(this.game.keys.includes('ArrowUp')) 
            this.speedY = -this.max_speed;
            else if(this.game.keys.includes('ArrowDown')) 
            this.speedY = this.max_speed;
            else this.speedY = 0;
            this.y+=this.speedY;
            this.projectiles.forEach(projectiles =>{
                projectiles.update();
            });
            this.projectiles = this.projectiles.filter(projectiles => !projectiles.markedForDeletion);
        }
        draw(context){
            context.fillStyle='black';
            context.fillRect(this.x,this.y,this.width,this.height);
            this.projectiles.forEach(projectiles =>{
                projectiles.draw(context);
            })
        }
        shoottop(){
            if(this.game.ammo > 0){
                this.projectiles.push(new Projectile(this.game,this.x+80,this.y+30));
                this.game.ammo--;
            }
        }

    }
    class Enemy{
        constructor(game){
            this.game= game;
            this.x = this.game.width;
            this.speedx = Math.random() * -1.5 -0.5;
            this.markedForDeletion = false;
            this.lives = 5;
            this.score =this.lives;
        }
        update(){
            this.x +=this.speedx;
            if(this.x + this.width < 0) this.markedForDeletion = true;
        }
        draw(context){
            context.fillStyle = 'red';
            context.fillRect(this.x, this.y, this.width, this.height);
            context.fillStyle = 'black';
            context.font = '20px Helvetca';
            context.fillText(this.lives,this.x,this.y);
        }

    }
    class Angler1 extends Enemy {
        constructor (game){
            super(game);
            this.width = 228 * 0.2;
            this.height = 169 * 0.2;
            this.y = Math.random() * (this.game.height * 0.9 - this.height);
        }
    }
    class UI{
        constructor(game) {
            this.game = game;
            this.fontSize = 25;
            this.fontFamily = 'Helvetica';
            this.color = 'red';
        }
        draw(context){
            context.save();
            // score
            context.fillStyle = this.color;
            context.shadowoffsetX = 2;
            context.shadowoffsetY = 2;
            context.shadowColor = 'black';
            context.font = this.fontSize + 'px' + this.fontFamily;
            context.fillText('Score: ' + this.game.score,20,40);
            for(let i = 0;i<this.game.ammo;i++){
                context.fillRect(20 + 5 * i, 50, 3, 20)
            }
            // timer
            const formattedtime = (this.game.gameTime * 0.001).toFixed(1)
            context.fillText('Timer: ' + formattedtime,20, 100);
            if(this.game.gameOver){
                context.textAlign = 'center';
                let msg1;
                let msg2;
                if(this.game.score > this.game.winningScore){
                    msg1 = "You Win";
                    msg2 = 'Well done';
                }
                else{
                    msg1 = "You Lose";
                    msg2 = "Try Again Later";
                }
                context.font = '50px ' + this.fontFamily;
                context.fillText(msg1,this.game.width * 0.5, this.game.height * 0.5 - 40)
                context.font = '25px ' + this.fontFamily;
                context.fillText(msg2,this.game.width * 0.5, this.game.height * 0.5 + 40)
            }
            context.restore();
        }
    }
    class Game{
        constructor(width,height){
            this.width = width;
            this.height = height;
            this.player = new Player(this);
            this.input = new InputHandler(this);
            this.keys = [];
            this.enemies = [];
            this.enemyTimer = 0;
            this.enemyInterval = 1000;
            this.ui = new UI(this);
            this.ammo = 20;
            this.maxAmmo = 50;
            this.ammoTimer = 0;
            this.ammoInterval = 500;
            this.gameOver = false;
            this.score = 0;
            this.winningscore = 10;
            this.gameTime = 0;
            this.timeLimit = 5000;
        }
        update(deltatime){
            if(!this.gameOver) this.gameTime+=deltatime;
            if(this.gameTime > this.timeLimit) this.gameOver = true;
            this.player.update();
            if(this.ammoTimer > this.ammoInterval){
                if(this.ammo < this.maxAmmo) 
                this.ammo++;
                this.ammoTimer = 0;
            }
            else{
                this.ammoTimer+=deltatime;
            }
            this.enemies.forEach(enemy => {
                enemy.update();
                if(this.checkCollision(this.player,enemy)){
                    enemy.markedForDeletion = true;
                }
                this.player.projectiles.forEach(projectiles => {
                    if(this.checkCollision(projectiles,enemy)){
                        enemy.lives--;
                        projectiles.markedForDeletion = true;
                        if(enemy.lives <=0 ){
                            enemy.markedForDeletion =true;
                            if(!this.gameOver)
                            this.score+=enemy.score;

                            if(this.score > this.winningscore)
                            this.gameOver = true;
                        }
                    }
                })
            })
            this.enemies = this.enemies.filter(Enemy => !Enemy.markedForDeletion); 
            if(this.enemyTimer > this.enemyInterval && !this.gameOver){
                this.addEnemy();
                this.enemyTimer = 0;
            } else{
                this.enemyTimer += deltatime;
            }
        }
        draw(context){
            this.player.draw(context);
            this.ui.draw(context);
            this.enemies.forEach(Enemy => {
                Enemy.draw(context);
            })
        }
        addEnemy(){
            this.enemies.push(new Angler1(this));
        }
        checkCollision(rect1,rect2){
            return(
                rect1.x < rect2.x + rect2.width &&
                rect1.x + rect1.width > rect2.x &&
                rect1.x < rect2.y + rect2.height &&
                rect1.height + rect1.y > rect2.y
            )
        }
    }
    // Creating the object game from class Game
    const game = new Game(canvas.width,canvas.height);
    let lasttime = 0;
    // animation starts from here 
    function animate(timestamp){
        const deltatime = timestamp - lasttime;
        lasttime = timestamp;
        ctx.clearRect(0,0, canvas.width,canvas.height);
        game.update(deltatime);
        game.draw(ctx);
        requestAnimationFrame(animate);
    }
    animate(0);
});