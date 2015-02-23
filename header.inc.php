<!-- Fixed navbar -->
    <nav class="navbar navbar-default" role="navigation">
      <div class="container-fluid">
	    <div class="navbar-header">
		  <a class="navbar-brand" href="http://transcriptorium.eu">TSX</a>
		  <a class="navbar-brand" href="http://transcriptorium.eu">
		   <img alt="Brand" src="./images/tS_logo.jpg" width="30"  />
		 </a>
		 <a class="navbar-brand" href="http://ec.europa.eu/research/index.cfm">
		   <img alt="Brand" src="./images/flag_yellow_high.png"  />
		 </a>
	     </div>
	     <ul class="nav navbar-nav">
		<li <?php print $menu['index'];?>><a href="./">Home</a></li>
		<li <?php print $menu['desk']; print $menu['transcribe'];?>><a href="./desk">Desk</a></li>
		<li <?php print $menu['userarea'];?>><a href="./userarea">User area</a></li>
	    </ul>
	    <div class="tsx-not-logged-in">
 	   	<button type="button" class="btn btn-default navbar-btn pull-right" data-toggle="modal" data-target="#loginModal">Sign in</button>
	   	<button type="button" class="btn btn-default navbar-btn pull-right" data-toggle="modal" data-target="#createAccountModal">Sign up</button>
	    </div>
	    <div class="tsx-logged-in"> 
	   	<button type="button" class="btn btn-default navbar-btn pull-right" id="tsx-sign-out">Sign out</button>
	    </div>
      </div>
    </nav>


