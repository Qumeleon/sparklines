import { SparkLines } from '../SparkLines'

export abstract class SparkLine {
  protected graph!: SparkLines

  render() {
    return this.graph.render()
  }
}
