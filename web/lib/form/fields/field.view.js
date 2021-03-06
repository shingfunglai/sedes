(function(simply) {
    
    simply.field = Backbone.View.extend({
        
        tagName: 'input',
        tagType: 'text',
        labelTagName: 'label',
        wrapperTagName: 'div',
        wrapperClass: 'fieldWrapper',
        label: null,
        fieldName: null,
        valid: false,
        wrapper: null,
        options: {},
        doNotValidate: false,
        
        initialize: function(options) {
            
            
            this.options = options;
            this.options.validation = options.validation || [];
            this.tagType = options.tagType || this.tagType;
            
            this.makeName();
            this.makeLabel();
            this.renderField();

            this.delegateEvents();

            


            _.bindAll(this);

        },
        
        events: {
            'blur': 'checkField' 
        },
        
        checkField: function() {
            this.validate(false);
        },
        
        makeName: function() {
            this.fieldName = this.options.form.name + '_' + this.options.id;
        },
        
        makeLabel: function() {
            this.label = this.make(this.labelTagName, {"for": this.fieldName}, this.options.label);
        },
        
        makeNote: function() {
            this.note = this.make('div', {"class": "fieldNote"}, this.options.note);  
        },
        
        render: function() {            
            this.makeWrapper();

            this.wrapper.append(this.label);
            this.wrapper.append(this.$el);
            
            if(this.options.note) {
                this.makeNote();
                this.wrapper.append(this.note);
            }
            
            this.renderActions();
            
            return this.wrapper;
        },
        
        makeWrapper: function() {
            this.wrapper = $(this.make(this.wrapperTagName, { "id": this.fieldName + '_wrapper', "class": this.wrapperClass}));
            
            if(this.options.className) {
                this.wrapper.addClass(this.options.className);
            }  
        },
        
        renderActions: function() {
            //Grab associated model value and set it
            if(this.options.form.model && this.options.modelField) {
                this.setVal(this.options.form.model.get(this.options.modelField));
            }
        },
        
        renderField: function() {
            console.log('rf: ' + this.tagType);
            this.setElement(this.make(this.tagName, { "type": this.tagType, "id" : this.fieldName, "name": this.fieldName}));
            
            return this.$el;
        },
        
        getVal: function() {
            return this.$el.val();
        },
        
        setVal: function(val) {
            this.$el.val(val);
        },
        
        validate: function(silent) {
  
            var obj = this;
            
            function regexValidator(regex) {
                return regex.test(obj.getVal())
            }
            
            this.errors = [];
            
            if(this.doNotValidate) {
                this.valid = true;
                return true;
            }
            
            //console.log(this.getVal() === this.options.label);

            var validCount, modelUpdate;
            
            this.valid = false;
            this.wrapper.removeClass('valid').removeClass('invalid');
            
            if(this.options.validation.length === 0) {
                this.valid = true;
            }else{
                
                validCount = 0;
                
                _.each(this.options.validation, function (rule) {
                    
                    cacheValidCount = validCount;
                    
                    if(typeof rule.type === 'function') {
                        //evaluate the func
                        if(rule.type.apply(this)) {
                            validCount +=1;
                        }
                    }else{
                        //Switch through some defaults
                        switch (rule.type) {
                            case "required":
                                if(this.getVal() !== undefined && this.getVal() !== '' && this.getVal() !== this.options.label) {
                                    validCount +=1;
                                }
                                break;
                            case "email":
                                if(regexValidator(/^([a-zA-Z0-9_\.\-])+\@(([a-zA-Z0-9\-])+\.)+([a-zA-Z0-9]{2,4})+$/)) {
                                    validCount +=1;
                                }
                                break;
                            case "phone":
                                if(regexValidator(/^((\(44\))( )?|(\(\+44\))( )?|(\+44)( )?|(44)( )?)?((0)|(\(0\)))?( )?(((1[0-9]{3})|(7[1-9]{1}[0-9]{2})|(20)( )?[7-8]{1})( )?([0-9]{3}[ -]?[0-9]{3})|(2[0-9]{2}( )?[0-9]{3}[ -]?[0-9]{4}))$/)) {
                                    validCount +=1;
                                }
                                break;
                        }
                    }
                    
                    if(cacheValidCount == validCount) {
                        //It didn't pass
                        this.errors.push(rule.msg);
                    }
                    
                }, this);
                
                this.valid = validCount === this.options.validation.length;
            }
            
            if(this.valid) {

                this.wrapper.addClass('valid');
                this.wrapper.removeClass('invalid');
                
                //Set associated model attribute
                if(this.options.form.model && this.options.modelField) {
                    modelUpdate = {};
                    modelUpdate[this.options.modelField] = this.getVal();

                    this.options.form.model.save(modelUpdate, {wait: !this.options.form.options.noWait});

                }
                
                if(typeof this.options.onValid === 'function') {
                    this.options.onValid.apply();
                }
                
            }else{
                if(!silent) {
                    this.wrapper.addClass('invalid');
                }
            }
            
            return this.valid;            
        }
    });
    
})(window.simply);