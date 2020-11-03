#!/usr/bin/env node

const fs = require('fs')
const program = require('commander')
const download = require('download-git-repo')
const handlebars = require('handlebars')
const inquirer = require('inquirer')
const ora = require('ora')
const chalk = require('chalk')
const symbols = require('log-symbols')
const package = require('./package.json')

program
  .version(package.version, '-v, --version')
  .command('init <name>')
  .action(name => {
    if (!fs.existsSync(name)) {
      inquirer
        .prompt([
          {
            name: 'description',
            message: 'Please enter a project description',
          },
          {
            name: 'author',
            message: 'Please enter the author name',
          },
        ])
        .then(answers => {
          const spinner = ora('Downloading template...')
          spinner.start()
          download(
            'https://github.com:WjiaoJ/npm-cli-demo#main',
            name,
            { clone: true },
            err => {
              if (err) {
                spinner.fail()
                console.log(symbols.error, chalk.red(err))
              } else {
                spinner.succeed()
                const fileName = `${name}/package.json`
                const meta = {
                  name,
                  description: answers.description,
                  author: answers.author,
                }
                if (fs.existsSync(fileName)) {
                  const content = fs.readFileSync(fileName).toString()
                  const result = handlebars.compile(content)(meta)
                  fs.writeFileSync(fileName, result)
                }
                console.log(
                  symbols.success,
                  chalk.green('Project initialization completed')
                )
              }
            }
          )
        })
    } else {
      // The error indicates that the project already exists, avoid overwriting the original project
      console.log(symbols.error, chalk.red('Project already exists'))
    }
  })

program.parse(process.argv)
