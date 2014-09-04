# -*- encoding: utf-8 -*-
Gem::Specification.new do |s|
  s.name        = "ember-data-factory-guy"
  s.version     = "0.6.2"
  s.platform    = Gem::Platform::RUBY
  s.authors     = ["Daniel Sudol", "Alex Opak"]
  s.email       = ["dansudol@yahoo.com", "opak.alexandr@gmail.com"]
  s.homepage    = "https://github.com/danielspaniel/ember-data-factory-guy"
  s.summary     = "Easily create Fixtures for Ember Data"
  s.description = "Easily create Fixtures for Ember Data"
  s.license     = "MIT"

  s.required_rubygems_version = ">= 1.3.6"
  s.rubyforge_project         = "ember-data-factory-guy"

  s.files        = `git ls-files`.split("\n")
  s.test_files   = `git ls-files -- {tests}/*`.split("\n")

  s.require_paths = ["lib"]
end