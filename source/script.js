
var _trumps=document.getElementById('trumps');
var	_trump_limit = 7;
var suits = ['A','E','W','F'];
//Distribution of trump circles for the suits.
var trump_dist = {	'F':{'one':12,'two':8,'three':4},
					'W':{'one':9,'two':4,'three':2},
					'A':{'one':9,'two':4,'three':2},
					'E':{'one':12,'two':2,'three':0},					
				};
//Manages some of the common game state
function GameMat(){
	this.trumps = new Trumps();
	this.adjusttrumps = function(card){
		this.trumps.set_trump_value(card.suit, this.trumps.get_trump_value(card.suit)+card.trump);
	}
	this.applyabilities =function(player_card, opponent_card){
		//TODO: The Face cards should have abilities
	}
	this.comparecards = function(player_card, opponent_card){
		this.trumps.sorttrumps();
		var player_trump = this.trumps.get_trump_value(player_card.suit),
			opponent_trump = this.trumps.get_trump_value(opponent_card.suit),
			player_value = player_card.value,
			opponent_value = opponent_card.value;
		var winner, loser;
		if (player_trump>opponent_trump){
			winner = 'player';
			loser = 'opponent';
		}else if (player_trump<opponent_trump){
			winner = 'opponent';
			loser = 'player';
		}else {
			if (player_value > opponent_value){
				winner = 'player';
				loser = 'opponent';
			}else if (player_value < opponent_value){
				winner = 'opponent';
				loser = 'player';
			}else {
				winner = 'tie';
				loser = 'tie';
			}
		}
		if (winner == 'player'){
			if (this.trumps.get_trump_value(player_card.suit) > 0){
				playr.points[player_card.suit] += 1 + this.trumps.get_trump_index(player_card.suit);
			}else{
				playr.points[player_card.suit] += 1;
			}
		}
		if (winner == 'opponent'){
			if (this.trumps.get_trump_value(opponent_card.suit) > 0){
				oppt.points[opponent_card.suit] += 1 + this.trumps.get_trump_index(opponent_card.suit);
			}else{
				oppt.points[opponent_card.suit] += 1;
			}
		}
		if (winner == 'tie'){
			oppt.points[opponent_card.suit] ++;
			playr.points[player_card.suit] ++;
		}	
		var burnouts = this.trumps.checkburnout();
		if (burnouts.length > 0){
			for (var i = burnouts.length - 1; i >= 0; i--) {
				if (burnouts[i]==player_card.suit){
					//TODO: Run burnout for player
				}
				if (burnouts[i]==opponent_card.suit){
					//TODO: Run burnout for opponent
				}				
			};
		}
		return;
	}
	this.render = function(){
		this.trumps.render();

		this.render_points(oppt.points, 'opponent-sidebar');
		this.render_points(playr.points, 'player-sidebar');
	}
	this.render_points = function(points, sidebar_name){
		var sidebar = document.getElementById(sidebar_name);
		emptynode(sidebar);
		for (var i = suits.length - 1; i >= 0; i--) {
			var pc = addnode('div','',sidebar,'pointcontainer');
			addnode('span','', pc,'trump t-'+suits[i]);
			addnode('span',points[suits[i]], pc,'points');
		}
	}
}
//Manages the Trumps display and burnout
function Trumps(){
	this.trumps = [	{'suit':'A','value':1},
					{'suit':'E','value':1},
					{'suit':'W','value':1},
					{'suit':'F','value':1}];	
	this.sorttrumps = function(){
		this.trumps.sort(function (a, b) {
		    if (a.value < b.value)
		      return -1;
		    if (a.value > b.value)
		      return 1;
		    return 0;
		});		
	}
	this.get_trump_value = function(suit){
		for (var i = this.trumps.length - 1; i >= 0; i--) {
			if (this.trumps[i].suit==suit)
				return this.trumps[i].value;
		};
		return null;
	}
	this.set_trump_value = function(suit, value){
		for (var i = this.trumps.length - 1; i >= 0; i--) {
			if (this.trumps[i].suit==suit && this.trumps[i].value >0){
				this.trumps[i].value = value;
				break;
			}
		};
	}	
	this.get_trump_index = function(suit){
		for (var i = this.trumps.length - 1; i >= 0; i--) {
			if (this.trumps[i].suit==suit)
				return i;
		};
		return null;
	}	
	this.render = function(){
		this.sorttrumps();
		emptynode(_trumps);
		for (var i = this.trumps.length - 1; i >= 0; i--) {
			multinode(_trumps,'t-'+this.trumps[i].suit,this.trumps[i].value);
		};
	}
	this.checkburnout = function(){
		var burnouts = [];
		for (var i = this.trumps.length - 1; i >= 0; i--) {
			if (this.trumps[i].value > _trump_limit){
				burnouts.push(this.trumps[i].suit);
				this.trumps[i].value =0;
			}
		};
		return burnouts;	
	}
	this.num_burned_out = function(){
		return this.trumps.filter(function(e){return e.value==0;}).length;
	}
}
//Deck object. Manages drawing and discarding of cards.
function Deck(element, show_hand, discard_name, play_name){
	this.drawdeck = [];
	this.discard = [];
	this.hand = [];	
	this._e = element;
	this.show = show_hand;
	this._hand_e = null;
	this._discard_e = document.getElementById(discard_name);
	this._play_e = document.getElementById(play_name);
	this._draw_e = null;

	//Draws to hand size of X cards
	this.draw = function(x){
		var v = x-this.hand.length;
		for (var i = v - 1; i >= 0; i--) {
			if (this.drawdeck.length > 0)
				this.hand.push(this.drawdeck.splice(rand(this.drawdeck.length-1,0),1)[0]);
		};
		this.render	();
	}
	this.reshuffle = function(){
		//Readd all of the discarded cards into drawdeck
		this.discard.forEach(function(c){this.drawdeck.push(c);}, this);
		this.discard = [];
	}
	this.discardFromHand = function(c){
		var i = this.hand.indexOf(c);
		if (i>=0){
			this.hand[i].remove_clickable();
			this.discard.push(this.hand.splice(i,1)[0]);
		}
		this.render();
	}
	this.discardFromDraw = function(){
		this.discard.push(this.drawdeck.splice(rand(this.drawdeck.length-1, 0),1)[0]);
		this.render();		
	}
	//Draws pieces of deck to screen
	this.render = function(){
		if (this._hand_e==null){
			this._hand_e = addnode('div','', this._e,'hand');
		}
		if (this._draw_e==null){
			this._draw_e = addnode('div','', this._e,'draw');
		}
		emptynode(this._discard_e);
		if (this.discard.length > 0){
			this.discard[this.discard.length-1].render(this._discard_e);
		}
		emptynode(this._play_e);
		if (this.choosencard != null){
			this.choosencard.render(this._play_e);
		}		
		emptynode(this._hand_e);
		this.hand.forEach(function(c){
			var card = c.render(this._hand_e, this.show);
		},this);
		this._draw_e.textContent = this.drawdeck.length;
	}
	//Turns on the clicks for the In Hand cards
	this.make_hand_clickable = function(){
		this.hand.forEach(function(c){
			c.make_clickable();
		},this);	
	}
	//Turns off the clicks for the In Hand cards
	this.remove_hand_clickable = function(){
		this.hand.forEach(function(c){
			c.remove_clickable();
		},this);
	}
	//Plays a card from the hand.
	this.play_card = function(card){
		var index = this.hand.indexOf(card);
		if (index <0 || index > this.hand.length){
			return;
		}
		card.remove_clickable();
		this.choosencard = this.hand.splice(index,1)[0];
		this.render();
	}
	//Discards played card
	this.discard_played = function(){
		this.discard.push(this.choosencard);
		this.choosencard = null;
		this.render();
	}
}
//Object encapsulating the Card concept. Does it's own rendering.
function Card(suit, value){
	this.suit = suit;
	this.value = value;
	this.deck = null;
	this.show = true;
	//Manage grabbing the number of trumps from the distribution
	if (this.value < trump_dist[suit].three){
		this.trump = 3;
	}else if (this.value < trump_dist[suit].two){
		this.trump = 2;
	}else if (this.value < trump_dist[suit].one){
		this.trump = 1;
	}else{
		this.trump = 0;
	}
	this._e = null
	this.render = function(parentNode,show){
		if (show==undefined){
			show = true;
		}
		if (!show){
			this.show = false;
		} else if (!this.show){
			//If we are switching from a face down to a face up card, need to redraw everything.
			this._e = null;
		}
		if (this._e==null)
		{
			var cardstyle = show ? this.suit + '-card ' + this.suit + '-' + this.value : 'card-back';
			this._e = addnode('div','',parentNode, 'card ' + cardstyle);
			if (show){
				addnode('span',this.convertedvalue(),this._e,'cardvalue' + this.convertedvalue_style());
				addnode('span','',this._e,'suit s-'+this.suit);
				multinode(this._e,'trump',this.trump);
			}
		}else{
			parentNode.appendChild(this._e);	
		}
		return this._e;
	}
	this.convertedvalue =function(){
		switch(this.value){
			case 13: return 'K';
			case 12: return 'Q';
			case 11: return 'J';
			default: return this.value;
		}

	}
	//Face cards should be shown different
	this.convertedvalue_style = function(){
		switch(this.value){
			case 13: return 'K';
			case 12: return 'Q';
			case 11: return 'J';
			default: return '';
		}
	}
	//Self-clickable, so we have a handle to easily detach
	this.handleEvent = function(event) {
		switch(event.type) {
			case 'click':
				this.deck.play_card(this);
				next_gamestep();				
				break;
		}
	}	
	this.make_clickable = function(){
		this._e.className += " clickable";
		this._e.addEventListener('click', this, false);
	}
	this.remove_clickable = function(){
		this._e.className = this._e.className.replace(" clickable","");
		this._e.removeEventListener('click', this, false);			
	}
}
//"Game Loop" for different stages
function next_gamestep(){
	//Start with three cards
	if (game_state == 'E'){
		game_state = 'D'; //Draw step
		if ((player_deck.drawdeck.length + player_deck.hand.length ==0)
			|| (opponent_deck.drawdeck.length + opponent_deck.hand.length ==0))
		{
			endgame();
		}
		player_deck.draw(3);
		opponent_deck.draw(3);
		game_state = 'P'; //Player turn
		player_deck.make_hand_clickable();
	} else if (game_state == 'P'){
		player_deck.remove_hand_clickable();
		game_state = 'O'; //Opponent chooses
		oppt.chooseCard();
		setTimeout(next_gamestep, 1*1000);	
	} else if (game_state == 'O'){
		game_state = 'T'; //Trumps
		game_mat.adjusttrumps(player_deck.choosencard);
		game_mat.adjusttrumps(opponent_deck.choosencard);
		setTimeout(next_gamestep, 1*1000);
	} else if (game_state == 'T'){
		game_state = 'B'; //Battle		
		game_mat.applyabilities(player_deck.choosencard, opponent_deck.choosencard);
		game_mat.comparecards(player_deck.choosencard, opponent_deck.choosencard);
		player_deck.discard_played();
		opponent_deck.discard_played();
		game_state = 'E';
		setTimeout(next_gamestep, 1*1000);
	}
	if (game_state != 'Z')
	{
		game_mat.render();
		if (game_mat.trumps.num_burned_out()==4){
			endgame();
		}
	}
}

//Opponent object
function Opponent(deck){
	this.deck = deck;
	this.points = {};
	for (var i = suits.length - 1; i >= 0; i--) {
		this.points[suits[i]] = 0;
	}
	this.chooseCard = function(){
		//TODO: Better AI.
		this.deck.play_card(this.deck.hand[0]);
	}
	this.score = function(){
		var score = 0;
		for (var i = suits.length - 1; i >= 0; i--) {
			var suit_points = this.points[suits[i]];
			if (score==0 || suit_points < score){
				score = suit_points;
			}
		}
		return score;
	}	
}
function Player(deck){
	this.points = {};
	this.deck = deck;
	this.points = {};
	for (var i = suits.length - 1; i >= 0; i--) {
		this.points[suits[i]] = 0;
	}
	this.score = function(){
		var score = 0;
		for (var i = suits.length - 1; i >= 0; i--) {
			var suit_points = this.points[suits[i]];
			if (score==0 || suit_points < score){
				score = suit_points;
			}
		}
		return score;
	}
}

//Utility Functions for manipulating DOM

//Adds a node with given content to given parent. 
function addnode(type, content, parent, classname){
	var node = document.createElement(type);
	node.textContent = content;
	if (classname!==undefined)
		node.className = classname;
	if (parent !==undefined)
		parent.appendChild(node);	
	return node;
}
//Adds multiple(X=value) spans inside a classed div 
function multinode(parent, className, value){
	var multi_e = parent.querySelector("div."+className);
	if (value==0 && multi_e!==null){
		parent.removeChild(multi_e);
	} else if (value > 0){
		if (multi_e===null)
		{
			multi_e = addnode('div','',parent,className + ' multi');
		}
		emptynode(multi_e);
		for (var i = value - 1; i >= 0; i--) {
			addnode('span','',multi_e,className);
		};
	}	
}
//Clear out the given node
function emptynode(node){
	if (node!==null){
		while (a= node.firstChild) {
			node.removeChild(a);
		}
	}
}
//Update an attribute
function updateattr(node, name, value)
{
	var attr=document.createAttribute(name);
	attr.nodeValue=value;
	node.attributes.setNamedItem(attr);
}
//Get an attribute value
function getattr(node, name){
	return node.attributes.getNamedItem(name).textContent;
}
//Shortening of the add event listener
function addlistener(id,type,listener){
	document.getElementById(id).addEventListener(type, listener);
}
//Standardizing of the random funciton
function rand(max,min){
	if (min==undefined) min=0;
	return Math.floor(Math.random() * max) + min;
}
//Function for easy listening to destroy "self" on click.
function pop(e){
	e.target.parentNode.removeChild(e.target);
}

function setup(){
	player_deck = new Deck(document.getElementById('player'), true, 'player-discard', 'player-play');
	opponent_deck = new Deck(document.getElementById('opponent'), false, 'opponent-discard', 'opponent-play');

	//Create the 52 cards.
	var prep_deck = [];
	for (var i = suits.length - 1; i >= 0; i--) {
		for (var j = 13 - 1; j >= 0; j--) {
			prep_deck.push(new Card(suits[i],j+1));
		};
	}
	//Deal them to the two playing decks.
	var max_cards = prep_deck.length;
	for (var k = max_cards - 1; k >= 0; k--) {
		var d = this.player_deck;
		if (k % 2 == 0){
			d = this.opponent_deck;
		}
		var c = prep_deck.splice(rand(prep_deck-1,0),1)[0];
		c.deck = d;
		d.drawdeck.push(c);
	};
	oppt = new Opponent(opponent_deck);
	playr = new Player(player_deck);	
	game_state = 'E'; //End of turn: Initial state for game.
	game_mat = new GameMat();
	next_gamestep();
	//Show the splash screen.
	addlistener('intro', 'click',pop);
}
function endgame(){
	game_state = 'Z'; //End Game
	player_score = playr.score();
	opponent_score = oppt.score();
	player_deck.remove_hand_clickable();
	opponent_deck.remove_hand_clickable();
	var end_info = addnode('div','', document.getElementById('wrap'), 'infobox');
	var playerresults = addnode('div','',end_info,'results'),
		opptresults = addnode('div','',end_info,'results');
	addnode('h2','End Game',end_info);
	addnode('h3','Player:',playerresults);
	addnode('div','',playerresults).id = 'player_score';
	game_mat.render_points(playr.points, 'player_score');		
	addnode('span','Score:' + player_score,playerresults);
	addnode('h3','Opponent',opptresults);
	addnode('div','',opptresults).id = 'opponent_score';
	game_mat.render_points(oppt.points, 'opponent_score');
	addnode('span','Score:' + opponent_score,opptresults);
	
	var winnertext = 'Player Wins.';
	if (opponent_score > player_score){
		winnertext = 'Opponent Wins.';
	}
	addnode('h2',winnertext,end_info);
}