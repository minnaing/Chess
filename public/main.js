var getDate = function(date) {
	var DD = date.getDate();
	DD = DD <= 9 ? '0' + DD : DD
	var MM = date.getMonth() + 1;
	MM = MM <= 9 ? '0' + MM : MM;
	var YYYY = date.getFullYear();
	return YYYY + '-' + MM + '-' + DD;
}

var makeHistory = function(history){
	var result = "";
	var start = 1;
	var i = 0;
	while (i < history.length){
		if (i%2 == 0){ result += "<br>" + start + ". "; start++; } 
		result += "<a href='" + history[i].fen + "'>" + history[i].san + "</a> " ;
		i++;
	}
	return  result;
}

var stdPgnHeader = {
	'Event' : '',
	'Site' : '',
	'Date' : '',
	'Round' : '',
	'White' : '',
	'Black' : '',
	'Result' : ''
}

var init = function() {
	var board,
	game = new Chess(),
	statusEl = $('#status'),
	fenEl = $('#fen'),
	pgnEl = $('#pgn'),
	history = $('#history');

	game.header('Event', '');
	game.header('Site', '');
	game.header('Date', getDate(new Date()));
	game.header('Round', '');
	game.header('White', 'Anonymous');
	game.header('Black', 'Anonymous');
	game.header('Result', '*');

	// do not pick up pieces if the game is over
	// only pick up pieces for the side to move
	var onDragStart = function(source, piece, position, orientation) {
		if (game.game_over() === true ||
			(game.turn() === 'w' && piece.search(/^b/) !== -1) ||
			(game.turn() === 'b' && piece.search(/^w/) !== -1)) {
			return false;
		}
	};

	var onDrop = function(source, target) {
		// see if the move is legal
		var move = game.move({
			from: source,
			to: target,
			promotion: 'q' // NOTE: always promote to a queen for example simplicity
		});


		// illegal move
		if (move === null) return 'snapback';

		updateStatus();
	};

	// update the board position after the piece snap 
	// for castling, en passant, pawn promotion
	var onSnapEnd = function() {
		board.position(game.fen());
	};

	var updateStatus = function() {
		var status = '';

		var moveColor = 'White';
		if (game.turn() === 'b') {
			moveColor = 'Black';
		}

		// checkmate?
		if (game.in_checkmate() === true) {
			status = 'Game over, ' + moveColor + ' is in checkmate.';
		}

		// draw?
		else if (game.in_draw() === true) {
			status = 'Game over, drawn position';
		}

		// game still on
		else {
			status = moveColor + ' to move';

			// check?
			if (game.in_check() === true) {
				status += ', ' + moveColor + ' is in check';
			}
		}

	  	var result = makeHistory(game.history({verbose: true}));

		history.html(result);
		statusEl.html(status);
		fenEl.val(game.fen());
		pgnEl.html(game.pgn({ max_width: 5, newline_char: '<br />' }));
	};

	var cfg = {
		draggable: true,
		position: 'start',
		onDragStart: onDragStart,
		onDrop: onDrop,
		pieceTheme: 'vendors/chessboardjs/www/img/chesspieces/wikipedia/{piece}.png',
		onSnapEnd: onSnapEnd
	};

	board = ChessBoard('board', cfg);

	updateStatus();


	$('#undoMove').on('click', function() {
		console.log("Undo Move");
		// Pop the last move from the Game
		game.undo();
		var fen = game.fen();
		board.position(fen, false);
		updateStatus();
	});

	$('#setUpStartingPosition').on('click', function() {
		console.log("Load Starting Position");
		board.position('start', false);
		game = new Chess();
		updateStatus();
	});

	$('#downloadPGN').on('click', function() {
		console.log("Download PGN file");
		var pgn = game.pgn();
		this.setAttribute('href', 'data:application/x-chess-pgn;charset=utf-8,' + encodeURIComponent(pgn));
		this.setAttribute('download', 'game' + '.pgn'); // later we will change to WhiteVsBlack-Event.pgn
	});

	var loadFEN = function(fen){
		// Force Board to FEN position
		board.position(fen, false);
	}

};