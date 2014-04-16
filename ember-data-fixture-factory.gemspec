# -*- encoding: utf-8 -*-
Gem::Specification.new do |s|
  s.name        = "ember-data-fixture-factory"
  s.version     = "0.1"
  s.platform    = Gem::Platform::RUBY
  s.authors     = ["daniel sudol", "alex opak"]
  s.email       = ["dansudol@yahoo.com"]
  s.homepage    = "http://rubygems.org/gems/ember-data-fixture-factory"
  s.summary     = "Create Fixtures for Ember Data"
  s.description = "Create Fixtures for Ember Data"
  s.license     = "MIT"

  s.required_rubygems_version = ">= 1.3.6"
  s.rubyforge_project         = "ember-data-fixture-factory"

  s.files        = `git ls-files`.split("\n")
  s.test_files   = `git ls-files -- {tests}/*`.split("\n")

  s.require_paths = ["lib"]
end