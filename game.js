let game;

const gameOptions = {
    playerGravity: 800,
    playerSpeed: 500,
    opponentSpeed: 500
}

window.onload = function () {
    let gameConfig = {
        type: Phaser.AUTO,
        backgroundColor: "#173102ff",
        scale: {
            mode: Phaser.Scale.FIT,
            autoCenter: Phaser.Scale.CENTER_BOTH,
            width: 800,
            height: 1000,
        },
        pixelArt: true,
        physics: {
            default: "arcade",
            arcade: {
                gravity: { y: 10 },
                debug: false
            }
        },
        scene: PlayGame
    };

    game = new Phaser.Game(gameConfig);
    window.focus();
}

class PlayGame extends Phaser.Scene {

    constructor() {
        super("PlayGame")
        this.scoreB = 0;
        this.scoreStar = 0;
        this.scoreHoop = 0;
    }

    preload() {
        this.load.image("fondo", "assets/background.jpg")
        this.load.image("pink-tile", "assets/pink_tile2.png")
        this.load.image("cupcake", "assets/cupcake.png")
        this.load.image("star", "assets/star.png")

        this.load.spritesheet("opponent", "assets/Dude_Monster_Throw_4.png", {
            frameWidth: 32,
            frameHeight: 32
        });

        this.load.spritesheet("pink", "assets/pink_run.png", {
            frameWidth: 32,
            frameHeight: 32
        });

        this.load.spritesheet("hoop-anim", "assets/hoop_anim.png", {
            frameWidth: 32,
            frameHeight: 32
        });

        this.load.spritesheet("small-opponent", "assets/Flame.png", {
            frameWidth: 128,
            frameHeight: 128
        });
    }

    create() {

        // HUD BACKGROUND
        this.hudBackground = this.add.rectangle(
            0, 0,
            this.game.config.width,
            100,
            0x000000,
            0.6
        );
        this.hudBackground.setOrigin(0, 0);
        this.hudBackground.setDepth(9);

        // Background
        this.fondo = this.add.image(400, 500, "fondo");
        this.fondo.setOrigin(0.5);
        this.fondo.setDepth(-10);
        this.fondo.setScale(1.2);

        // Ground
        this.groundGroup = this.physics.add.group({
            immovable: true,
            allowGravity: false
        })

        for (let i = 0; i < 10; i++) {
            let tile = this.groundGroup.create(
                Phaser.Math.Between(0, game.config.width),
                Phaser.Math.Between(0, game.config.height),
                "pink-tile"
            );
            tile.setScale(0.5)
        }

        // Player
        this.player = this.physics.add.sprite(
            game.config.width / 2,
            game.config.height / 2.5,
            "pink"
        );
        this.player.setScale(2.5);
        this.player.body.gravity.y = gameOptions.playerGravity;
        this.physics.add.collider(this.player, this.groundGroup);

        // Groups
        this.basketballsGroup = this.physics.add.group({})
        this.starGroup = this.physics.add.group({})
        this.hoopGroup = this.physics.add.group({})
        this.jordan = this.physics.add.group({})
        this.smallJordan = this.physics.add.group({})

        this.physics.add.collider(this.groundGroup, this.starGroup)
        this.physics.add.overlap(this.player, this.basketballsGroup, this.collectBasketball, null, this)
        this.physics.add.overlap(this.player, this.starGroup, this.collectStar, null, this)
        this.physics.add.overlap(this.player, this.hoopGroup, this.hoop, null, this)
        this.physics.add.overlap(this.player, this.jordan, this.collideWithBigJordan, null, this)
        this.physics.add.overlap(this.player, this.smallJordan, this.collideWithSmallJordan, null, this)

        // HUD ELEMENTS
        let imgB = this.add.image(40, 40, "cupcake").setScale(0.06).setDepth(10);
        this.scoreBText = this.add.text(90, 23, "0", { fontSize: "30px", fill: "#ffffff" }).setDepth(10);

        let imgS = this.add.image(158, 40, "star").setScale(0.10).setDepth(10);
        this.scoreStarText = this.add.text(200, 23, "0", { fontSize: "30px", fill: "#ffffff" }).setDepth(10);

        let imgH = this.add.sprite(280, 40, "hoop-anim", 0).setScale(2.0).setDepth(10);
        imgH.play("hoop-spin");
        this.scoreHoopText = this.add.text(330, 23, "0", { fontSize: "30px", fill: "#ffffff" }).setDepth(10);

        this.eventText = this.add.text(370, 23, "", { fontSize: "30px", fill: "#ffffffff" }).setDepth(10);

        this.cursors = this.input.keyboard.createCursorKeys();

        // Animations
        this.anims.create({
            key: "pink-run",
            frames: this.anims.generateFrameNumbers("pink", { start: 0, end: 5 }),
            frameRate: 12,
            repeat: -1
        });

        this.anims.create({
            key: "hoop-spin",
            frames: this.anims.generateFrameNumbers("hoop-anim", { start: 0, end: 3 }),
            frameRate: 8,
            repeat: -1
        });

        this.anims.create({
            key: "opponent-anim",
            frames: this.anims.generateFrameNumbers("opponent", { start: 0, end: 3 }),
            frameRate: 8,
            repeat: -1
        });

        this.anims.create({
            key: "small-opponent-anim",
            frames: this.anims.generateFrameNumbers("small-opponent", { start: 0, end: 7 }),
            frameRate: 12,
            repeat: -1
        });

        // Timer
        this.triggerTimer = this.time.addEvent({
            callback: this.addGround,
            callbackScope: this,
            delay: 700,
            loop: true
        });

        // Show record
        let record = localStorage.getItem("recordHoop");
        document.getElementById("record").textContent = "Récord: " + (record ? record : 0);
    }

    // ⭐ FUNCIÓN ÚNICA DE GAME OVER ⭐
    gameOver(message = "") {

        // Calcular score final
        let finalScore = this.scoreHoop * (this.scoreStar === 0 ? 1 : this.scoreStar);

        // Obtener récord
        let record = localStorage.getItem("recordHoop");
        record = record ? parseInt(record) : 0;

        // Actualizar récord
        if (finalScore > record) {
            localStorage.setItem("recordHoop", finalScore);
            record = finalScore;
        }

        // Mostrarlo en el panel
        document.getElementById("record").textContent = "Récord: " + record;

        // Texto de evento
        this.eventText.setText(message);

        // Reset
        this.scoreB = 0;
        this.scoreStar = 0;
        this.scoreHoop = 0;

        // Reiniciar escena
        this.scene.start("PlayGame");
    }

    addGround() {

        let tile = this.groundGroup.create(
            Phaser.Math.Between(0, game.config.width),
            0, "pink-tile"
        );
        tile.setScale(0.5)
        this.groundGroup.setVelocityY(gameOptions.playerSpeed / 6)

        // CUPCAKE
        if (Phaser.Math.Between(0, 1)) {
            let cupcake = this.basketballsGroup.create(
                Phaser.Math.Between(0, game.config.width),
                0,
                "cupcake"
            );
            cupcake.setScale(0.10)
            this.basketballsGroup.setVelocityY(gameOptions.playerSpeed)
        }

        // HOOP
        if (Phaser.Math.Between(0, 1)) {
            let hoop = this.hoopGroup.create(
                Phaser.Math.Between(0, game.config.width),
                0,
                "hoop-anim"
            );
            hoop.setScale(2.5)
            hoop.play("hoop-spin")
            this.hoopGroup.setVelocityY(gameOptions.playerSpeed)
        }

        // STAR
        if (Phaser.Math.Between(0, 0.7)) {
            let star = this.starGroup.create(
                Phaser.Math.Between(0, game.config.width),
                0,
                "star"
            );
            star.setScale(0.10)
            star.setVelocityY(gameOptions.playerSpeed)
            star.setVelocityX(gameOptions.opponentSpeed / 6)
        }

        // OPONENTES ALEATORIOS
        const spawnSide = Phaser.Math.Between(1, 4);

        let x, y, velX, velY;

        if (spawnSide === 1) {
            x = Phaser.Math.Between(0, game.config.width);
            y = -50;
            velX = Phaser.Math.Between(-200, 200);
            velY = gameOptions.opponentSpeed;
        }
        else if (spawnSide === 2) {
            x = Phaser.Math.Between(0, game.config.width);
            y = game.config.height + 50;
            velX = Phaser.Math.Between(-200, 200);
            velY = -gameOptions.opponentSpeed;
        }
        else if (spawnSide === 3) {
            x = -50;
            y = Phaser.Math.Between(0, game.config.height);
            velX = gameOptions.opponentSpeed;
            velY = Phaser.Math.Between(-200, 200);
        }
        else {
            x = game.config.width + 50;
            y = Phaser.Math.Between(0, game.config.height);
            velX = -gameOptions.opponentSpeed;
            velY = Phaser.Math.Between(-200, 200);
        }

        // BIG OPPONENT
        if (Phaser.Math.Between(0, 5) === 0) {
            let big = this.jordan.create(x, y, "opponent");
            big.setScale(4.0);
            big.play("opponent-anim");
            big.setVelocity(velX, velY);

            big.body.setSize(25, 35);
            big.body.setOffset(3, 0);
        }

        // SMALL OPPONENT
        if (Phaser.Math.Between(0, 10) === 0) {
            let small = this.smallJordan.create(x, y, "small-opponent");
            small.setScale(1.3);
            small.play("small-opponent-anim");
            small.setVelocity(velX, velY);

            small.body.setSize(55, 65);
            small.body.setOffset(35, 70);
        }
    }

    collectBasketball(player, cupcake) {
        cupcake.disableBody(true, true)
        this.scoreB++
        this.scoreBText.setText(this.scoreB)
    }

    collectStar(player, star) {
        star.disableBody(true, true)
        this.scoreStar++;
        this.scoreStarText.setText(this.scoreStar)
        this.eventText.setText("Estrella cogida!")
    }

    hoop(player, hoop) {
        hoop.disableBody(true, true)
        if (this.scoreB > 0) {
            this.scoreB--
            this.scoreHoop++
            this.scoreBText.setText(this.scoreB)
            this.scoreHoopText.setText(this.scoreHoop)
        }
        this.eventText.setText("Alimentaste a Hoop")
    }

    // MUERTE POR FLAME
    collideWithSmallJordan() {
        this.gameOver("¡Estás fuera del juego!");
    }

    // GLOTON SOLO ROBA
    collideWithBigJordan() {
        this.eventText.setText("¡Glotón te robó!");
        this.scoreB = 0
        this.scoreBText.setText(this.scoreB)
    }

    update() {

        if (this.cursors.left.isDown) {
            this.player.setVelocityX(-gameOptions.playerSpeed);
            this.player.flipX = true;
            this.player.anims.play("pink-run", true);
        }
        else if (this.cursors.right.isDown) {
            this.player.setVelocityX(gameOptions.playerSpeed);
            this.player.flipX = false;
            this.player.anims.play("pink-run", true);
        }
        else {
            this.player.setVelocityX(0);
            this.player.anims.stop();
            this.player.setFrame(0);
        }

        if (this.cursors.up.isDown) {
            this.player.setVelocityY(-gameOptions.playerGravity / 1.6);
        }

        // MUERTE POR CAÍDA
        if (this.player.y > 1000 || this.player.y < 0) {
            this.gameOver("Caíste fuera del mapa");
        }
    }
}
