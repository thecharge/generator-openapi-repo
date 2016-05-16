'use strict';
var yeoman = require('yeoman-generator');
var chalk = require('chalk');
var yosay = require('yosay');
var yaml = require('node-yaml');

module.exports = yeoman.Base.extend({
  prompting: function () {
    // Have Yeoman greet the user.
    this.log(yosay(
      'Welcome to the ' + chalk.green('OpenAPI-Repo') + ' generator!'
    ));

    var swagger = {};
    if (this.fs.exists(this.destinationPath('spec/swagger.yaml'))) {
      swagger = yaml.readSync(this.destinationPath('spec/swagger.yaml'));
      swagger.info = swagger.info || {};
      swagger.info.contact = swagger.info.contact || {};
    }

    var prompts = [{
      type: 'input',
      name: 'name',
      message: 'Your API name',
      default: swagger.title || this.appname
    }, {
      type: 'input',
      name: 'description',
      message: 'Short description',
      default: swagger.info.description || ''
    }, {
      type: 'input',
      name: 'version',
      message: 'API version',
      default: swagger.info.version || '1.0.0'
    }, {
      type: 'input',
      name: 'email',
      message: 'Contact email',
      default: swagger.info.contact.email || this.user.git.email()
    }, {
      type: 'input',
      name: 'username',
      message: 'Author name',
      default: swagger.info.contact.name || this.user.git.name()
    }, {
      type: 'input',
      name: 'redocVersion',
      message: 'ReDoc version to use (e.g. v0.9.0)',
      default: 'latest'
    }, {
      type: 'confirm',
      name: 'travis',
      message: 'Setup CI on Travis',
      default: true
    }, {
      when: function (props) {
        return props.travis;
      },
      type: 'input',
      name: 'repo',
      message: 'GitHub Repository (e.g. Rebilly/RebillyAPI)',
      default: 'upateme/updateme'
    }, {
      type: 'confirm',
      name: 'samples',
      message: 'Prepare code samples',
      default: true
    }, {
      type: 'confirm',
      name: 'installSwaggerUI',
      message: 'Install SwaggerUI',
      default: true
    }];

    return this.prompt(prompts).then(function (props) {
      // To access props later use this.props.someAnswer;
      this.props = props;
      this.config.save();
    }.bind(this));
  },

  writing: {
    config: function () {
      this.fs.copy(
        this.templatePath('_.gitignore'),
        this.destinationPath('.gitignore')
      );
      if (!this.fs.exists(this.destinationPath('LICENSE'))) {
        this.fs.copy(
          this.templatePath('_LICENSE'),
          this.destinationPath('LICENSE')
        );
      }
      this.fs.copyTpl(
        this.templatePath('_package.json'),
        this.destinationPath('package.json'), this.props
      );
      this.fs.copyTpl(
        this.templatePath('_README.md'),
        this.destinationPath('README.md'), this.props
      );
      if (this.props.travis) {
        this.fs.copy(
          this.templatePath('_.travis.yml'),
          this.destinationPath('.travis.yml')
        );
      }
    },
    scripts: function () {
      this.fs.copyTpl(
        this.templatePath('_gulpfile.js'),
        this.destinationPath('gulpfile.js'), this.props
      );
      this.fs.copy(
        this.templatePath('_scripts/build.js'),
        this.destinationPath('scripts/build.js')
      );
      this.fs.delete(this.destinationPath('scripts/build.sh'));
    },
    web: function () {
      this.fs.copyTpl(
        this.templatePath('_web/index.html'),
        this.destinationPath('web/index.html'), this.props
      );
    },
    mainswagger: function () {
      if (this.fs.exists(this.destinationPath('spec/swagger.yaml'))) {
        return;
      }
      this.fs.copyTpl(
        this.templatePath('_spec/swagger.yaml'),
        this.destinationPath('spec/swagger.yaml'), this.props
      );

      this.fs.copy(this.templatePath('_spec/paths/pet.yaml'),
        this.destinationPath('spec/paths/pet.yaml')
      );
      this.fs.copy(this.templatePath('_spec/paths/README.md'),
        this.destinationPath('spec/paths/README.md')
      );
      this.fs.copy(this.templatePath('_spec/definitions/Pet.yaml'),
        this.destinationPath('spec/definitions/Pet.yaml')
      );
      this.fs.copy(this.templatePath('_spec/definitions/README.md'),
        this.destinationPath('spec/definitions/README.md')
      );
    },
    samples: function () {
      if (!this.props.samples) {
        return;
      }
      if (this.fs.exists(this.destinationPath('spec/code_samples/README.md'))) {
        return;
      }
      this.bulkDirectory('_spec/code_samples', 'spec/code_samples');
    }
  },

  install: function () {
    this.installDependencies({
      bower: false
    });
  }
});
