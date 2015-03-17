<div class="modal fade" id="loginModal" tabindex="-1" role="dialog" aria-labelledby="tsx-login" aria-hidden="true">
    <div class="modal-dialog">
        <div class="modal-content">
            <div class="modal-header">
                <button type="button" class="close" data-dismiss="modal" aria-hidden="true">&times;</button>
                <h4 class="modal-title" id="tsx-login">Sign in</h4>
            </div>

            <div class="modal-body">
                <!-- The form is placed inside the body of modal -->
                <form id="loginForm" method="post" class="form-horizontal">
                    <div class="form-group">
                        <label class="col-xs-3 control-label">Email</label>
                        <div class="col-xs-5">
                            <input type="text" class="form-control" name="user" />
                        </div>
                    </div>

                    <div class="form-group">
                        <label class="col-xs-3 control-label">Password</label>
                        <div class="col-xs-5">
                            <input type="password" class="form-control" name="pw" />
                        </div>
                    </div>

                    <div class="form-group">
                        <div class="col-xs-5 col-xs-offset-3">
                            <button type="submit" class="btn btn-default">Sign in</button>
							<span class="btn btn-default" id="forgotPw">Forgotten password?</span>
                        </div>
                    </div>
                </form>
            </div>
        </div>
    </div>
</div>
<div class="modal fade" id="createAccountModal" tabindex="-1" role="dialog" aria-labelledby="tsx-create-account" aria-hidden="true">
    <div class="modal-dialog">
        <div class="modal-content">
            <div class="modal-header">
                <button type="button" class="close" data-dismiss="modal" aria-hidden="true">&times;</button>
                <h4 class="modal-title" id="tsx-create-account">Create account</h4>
            </div>

            <div class="modal-body">
                <!-- The form is placed inside the body of modal -->
                <form id="createAccountForm" method="post" class="form-horizontal">
                    <div class="form-group">
                        <label class="col-xs-3 control-label">Email</label>
                        <div class="col-xs-5">
                            <input type="text" class="form-control" name="user" />
                        </div>
                    </div>
                    <div class="form-group">
                        <label class="col-xs-3 control-label">Password</label>
                        <div class="col-xs-5">
                            <input type="password" class="form-control" name="pw" />
                        </div>
                    </div>

                    <div class="form-group">
                        <label class="col-xs-3 control-label">Given name</label>
                        <div class="col-xs-5">
                            <input type="text" class="form-control" name="firstName" />
                        </div>
		    </div>
                    <div class="form-group">
                        <label class="col-xs-3 control-label">Family name</label>
                        <div class="col-xs-5">
                            <input type="text" class="form-control" name="lastName" />
                        </div>
                    </div>
<!--
                    <div class="form-group">
                        <label class="col-xs-3 control-label">Email</label>
                        <div class="col-xs-5">
                            <input type="text" class="form-control" name="email" />
                        </div>
                    </div>
                    <div class="form-group">
                        <label class="col-xs-3 control-label">Affiliation</label>
                        <div class="col-xs-5">
                            <input type="text" class="form-control" name="affiliation" />
                        </div>
                    </div>
-->
                    <div class="form-group">
                        <label class="col-xs-3 control-label">Gender</label>
                        <div class="col-xs-5">
			    <select class="form-control" name="gender">
				<option value="Female">Female</option>
				<option value="Male">Male</option>
				<option value="Other">Other</option>
			    </select>
                        </div>
                    </div>
                   <div class="form-group">
		        <div class="col-xs-3 control-label"></div>
                        <div class="col-xs-5">	
	 			<div class="g-recaptcha" data-sitekey="6LfKFQITAAAAAO4EFVHH0khqnzs9P2Y61MDmvFES"></div>
			</div>
                    </div>
                    <input type="hidden" class="form-control" name="application" value="TSX"/>
                    <div class="form-group">
                        <div class="col-xs-5 col-xs-offset-3">
                            <button type="submit" class="btn btn-default">Sign up</button>
                        </div>
                    </div>
                </form>
            </div>
        </div>
    </div>
</div>

