/* ========================================
   DATE AUTOMATIQUE
======================================== */

const today = new Date();

const dateText = new Intl.DateTimeFormat(
    "fr-FR",
    {
        day: "2-digit",
        month: "long",
        year: "numeric"
    }
).format(today);


document.querySelector("#letterDate").textContent = dateText;

document.querySelector("#finalDate").textContent = dateText;



/* ========================================
   APPARITION AU SCROLL
======================================== */

const observer = new IntersectionObserver(

    (entries) => {

        entries.forEach((entry) => {

            if (entry.isIntersecting) {

                entry.target.classList.add("visible");

                observer.unobserve(entry.target);
            }

        });

    },

    {
        threshold: 0.12
    }

);


document
    .querySelectorAll(".reveal")
    .forEach((element) => {

        observer.observe(element);

    });



/* ========================================
   BOUTON HERO
======================================== */

document
    .querySelector("#openLetter")
    .addEventListener("click", () => {

        document
            .querySelector("#letter")
            .scrollIntoView({
                behavior: "smooth"
            });

    });



/* ========================================
   LUMIÈRE QUI SUIT LA SOURIS
======================================== */

const glow =
    document.querySelector(".cursor-glow");


window.addEventListener(
    "pointermove",
    (event) => {

        glow.style.left =
            `${event.clientX}px`;

        glow.style.top =
            `${event.clientY}px`;


        /* Petit effet de parallaxe */

        const x =
            (
                event.clientX /
                window.innerWidth -
                0.5
            ) * 12;


        const y =
            (
                event.clientY /
                window.innerHeight -
                0.5
            ) * 8;


        const envelope =
            document.querySelector(
                ".floating-envelope"
            );


        if (envelope) {

            envelope.style.margin =
                `${y}px 0 0 ${x}px`;
        }

    }
);



/* ========================================
   PRÉNOMS
======================================== */

const nameOne =
    document.querySelector("#nameOne");


const nameTwo =
    document.querySelector("#nameTwo");


function updateNames() {

    const firstName =
        nameOne.value.trim();


    const secondName =
        nameTwo.value.trim();


    document.querySelector(
        "#sigNameOne"
    ).textContent =
        firstName || "toi";


    document.querySelector(
        "#sigNameTwo"
    ).textContent =
        secondName || "ton amour";


    /* Sauvegarde locale */

    localStorage.setItem(
        "pacte_name_one",
        nameOne.value
    );


    localStorage.setItem(
        "pacte_name_two",
        nameTwo.value
    );

}



/* Récupérer les anciens prénoms */

nameOne.value =
    localStorage.getItem(
        "pacte_name_one"
    ) || "";


nameTwo.value =
    localStorage.getItem(
        "pacte_name_two"
    ) || "";


nameOne.addEventListener(
    "input",
    updateNames
);


nameTwo.addEventListener(
    "input",
    updateNames
);


updateNames();



/* ========================================
   SYSTÈME DE SIGNATURE
======================================== */

class SignaturePadLite {

    constructor(canvas, storageKey) {

        this.canvas = canvas;

        this.ctx =
            canvas.getContext("2d");

        this.storageKey =
            storageKey;

        this.drawing = false;

        this.hasInk = false;


        this.ctx.lineWidth = 2.2;

        this.ctx.lineCap = "round";

        this.ctx.lineJoin = "round";

        this.ctx.strokeStyle =
            "#79571e";


        this.resize();

        this.restore();


        window.addEventListener(
            "resize",
            () => this.resize()
        );


        canvas.addEventListener(
            "pointerdown",
            (event) =>
                this.start(event)
        );


        canvas.addEventListener(
            "pointermove",
            (event) =>
                this.draw(event)
        );


        canvas.addEventListener(
            "pointerup",
            () => this.stop()
        );


        canvas.addEventListener(
            "pointerleave",
            () => this.stop()
        );

    }



    /* Redimensionnement du canvas */

    resize() {

        const ratio =
            window.devicePixelRatio || 1;


        const rect =
            this.canvas.getBoundingClientRect();


        const old =
            this.hasInk
                ? this.canvas.toDataURL()
                : null;


        this.canvas.width =
            rect.width * ratio;


        this.canvas.height =
            rect.width *
            (260 / 700) *
            ratio;


        this.ctx.setTransform(
            ratio,
            0,
            0,
            ratio,
            0,
            0
        );


        this.ctx.lineWidth = 2.2;

        this.ctx.lineCap =
            "round";

        this.ctx.lineJoin =
            "round";

        this.ctx.strokeStyle =
            "#79571e";


        if (old && old !== "data:,") {

            const image =
                new Image();


            image.onload = () => {

                this.ctx.drawImage(
                    image,
                    0,
                    0,
                    rect.width,
                    rect.width *
                    (260 / 700)
                );

            };


            image.src = old;

        }

    }



    /* Position de la souris */

    point(event) {

        const rect =
            this.canvas.getBoundingClientRect();


        return {

            x:
                event.clientX -
                rect.left,

            y:
                event.clientY -
                rect.top

        };

    }



    /* Début du dessin */

    start(event) {

        this.drawing = true;

        this.hasInk = true;


        this.canvas.setPointerCapture?.(
            event.pointerId
        );


        const point =
            this.point(event);


        this.ctx.beginPath();

        this.ctx.moveTo(
            point.x,
            point.y
        );

    }



    /* Dessiner */

    draw(event) {

        if (!this.drawing) return;


        const point =
            this.point(event);


        this.ctx.lineTo(
            point.x,
            point.y
        );


        this.ctx.stroke();

    }



    /* Fin du dessin */

    stop() {

        if (!this.drawing) return;


        this.drawing = false;

        this.save();

    }



    /* Sauvegarder */

    save() {

        localStorage.setItem(
            this.storageKey,
            this.canvas.toDataURL(
                "image/png"
            )
        );

    }



    /* Restaurer */

    restore() {

        const data =
            localStorage.getItem(
                this.storageKey
            );


        if (!data) return;


        const image =
            new Image();


        image.onload = () => {

            const rect =
                this.canvas.getBoundingClientRect();


            this.ctx.drawImage(
                image,
                0,
                0,
                rect.width,
                rect.width *
                (260 / 700)
            );


            this.hasInk = true;

        };


        image.src = data;

    }



    /* Effacer */

    clear() {

        const rect =
            this.canvas.getBoundingClientRect();


        this.ctx.clearRect(
            0,
            0,
            rect.width,
            rect.width *
            (260 / 700)
        );


        this.hasInk = false;


        localStorage.removeItem(
            this.storageKey
        );

    }

}



/* Création des deux signatures */

const padOne =
    new SignaturePadLite(
        document.querySelector("#padOne"),
        "pacte_signature_one"
    );


const padTwo =
    new SignaturePadLite(
        document.querySelector("#padTwo"),
        "pacte_signature_two"
    );



/* ========================================
   BOUTONS EFFACER
======================================== */

document
    .querySelectorAll(".clear-sign")
    .forEach((button) => {

        button.addEventListener(
            "click",
            () => {

                const pad =
                    button.dataset.pad === "padOne"
                        ? padOne
                        : padTwo;


                pad.clear();

            }
        );

    });



/* ========================================
   SCELLER LA PROMESSE
======================================== */

document
    .querySelector("#sealPromise")
    .addEventListener(
        "click",
        () => {

            const hasOne =
                padOne.hasInk;


            const hasTwo =
                padTwo.hasInk;


            /* Vérification */

            if (!hasOne || !hasTwo) {

                const message =
                    !hasOne && !hasTwo

                        ? "Ajoutez vos deux signatures avant de sceller la promesse."

                        : "Il manque encore une signature avant de sceller la promesse.";


                alert(message);

                return;

            }



            /* Afficher popup */

            const overlay =
                document.querySelector(
                    "#successOverlay"
                );


            overlay.classList.add("open");


            overlay.setAttribute(
                "aria-hidden",
                "false"
            );



            /* Animation de particules */

            for (
                let i = 0;
                i < 18;
                i++
            ) {

                const heart =
                    document.createElement(
                        "span"
                    );


                heart.textContent =
                    i % 3 === 0
                        ? "✦"
                        : "♡";


                heart.style.position =
                    "fixed";


                heart.style.left =
                    "50%";


                heart.style.top =
                    "50%";


                heart.style.zIndex =
                    "120";


                heart.style.color =
                    "#c69a4e";


                heart.style.pointerEvents =
                    "none";


                heart.style.fontSize =
                    `${10 + Math.random() * 18}px`;


                heart.animate(

                    [

                        {
                            transform:
                                "translate(-50%, -50%) scale(.4)",

                            opacity: 1
                        },


                        {

                            transform:
                                `translate(
                                    calc(-50% + ${(Math.random() - .5) * 500}px),
                                    calc(-50% + ${(Math.random() - .5) * 400}px)
                                )
                                scale(1.2)`,

                            opacity: 0

                        }

                    ],

                    {

                        duration:
                            1200 +
                            Math.random() * 700,

                        easing:
                            "cubic-bezier(.2,.8,.2,1)"

                    }

                );


                document.body.appendChild(
                    heart
                );


                setTimeout(
                    () => heart.remove(),
                    2000
                );

            }

        }
    );



/* ========================================
   FERMER POPUP
======================================== */

document
    .querySelector("#closeSuccess")
    .addEventListener(
        "click",
        () => {

            const overlay =
                document.querySelector(
                    "#successOverlay"
                );


            overlay.classList.remove(
                "open"
            );


            overlay.setAttribute(
                "aria-hidden",
                "true"
            );

        }
    );



/* Fermer en cliquant autour */

document
    .querySelector("#successOverlay")
    .addEventListener(
        "click",
        (event) => {

            if (
                event.target ===
                document.querySelector(
                    "#successOverlay"
                )
            ) {

                document
                    .querySelector(
                        "#closeSuccess"
                    )
                    .click();

            }

        }
    );



/* ========================================
   RETOUR EN HAUT
======================================== */

document
    .querySelector("#backTop")
    .addEventListener(
        "click",
        () => {

            window.scrollTo({

                top: 0,

                behavior: "smooth"

            });

        }
    );