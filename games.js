let userScore  = 0;
let compScore = 0;

let choices  = document.querySelectorAll(".image");

// selecting result 

const message = document.querySelector("#result");

//selecting point box

 const userpoint =document.querySelector("#userPoint");

 const compPoint=document.querySelector("#computerPoint");



// showing winner

const showWnner = (cond , compChoice , choiceId)=>{
     
    if(cond===true){
        console.log("You Won !!");
        message.innerHTML = `<h1>You won !! ${choiceId} beats ${compChoice}  </h1><img src='GameImage/congratulations.png'>`;
        message.style.backgroundColor="rgba(45, 179, 45, 1)";
        userScore++;
        userpoint.innerText=userScore;
    }

    else {
        console.log("Computer won");
        message.innerHTML = `<h1>You loss !! ${choiceId} beats ${compChoice}  </h1><img src='GameImage/lose.png'>`;
        message.style.backgroundColor=  " rgb(237, 12, 12)";
        compScore++;
        compPoint.innerText=compScore;
    }
}


// Selecting computer choice 

const getCompChoice = ()=>{

    const option = ["rock", "paper" , "scissor"];

    let randIdx = Math.floor(Math.random()*3);

    return option[randIdx];
}


// compairing the match or choice 

const playGame = (choiceId)=>{

    console.log("Use rchoice is ", choiceId);

    // generate computer choice 
    compChoice = getCompChoice();

    console.log("Computer choice is ",compChoice);

    if(compChoice===choiceId){
        message.innerHTML = `<h1>Its a draw! both chooses ${choiceId}  </h1><img src='GameImage/equality.png'>`;
        message.style.backgroundColor="rgba(83, 120, 240, 1)";
    }

    else{

        let cond = true;

        if(choiceId==="rock"){

           cond = (compChoice==="scissor")?true:false;
        }

        else if(choiceId==="paper"){
            cond = (compChoice==="rock")?true:false;
        }
        else {
            cond = (compChoice==="paper")?true:false;
        }

        showWnner(cond, compChoice,choiceId);


    }

}

// selecting user choice 

choices.forEach(choice => {
    choice.addEventListener("click", () => {
        const choiceId = choice.getAttribute("id");
        playGame(choiceId);
    });
});

